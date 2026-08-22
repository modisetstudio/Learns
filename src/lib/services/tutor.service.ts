import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { prisma } from "@/lib/prisma";
import { chatTokenLimiter, chatMessageLimiter, chatPerTaskLimiter } from "@/lib/rate-limit";
import { tutorCache } from "@/lib/tutor-cache";
import { CHAT_RATE_LIMIT } from "@/constants";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";
import type { SolutionStep } from "@/types";

const MODEL_ID = "gemini-2.0-flash";

// `@ai-sdk/google` reads `GOOGLE_GENERATIVE_AI_API_KEY` by default, which
// doesn't match our `.env` naming (`GEMINI_API_KEY`) - wire it explicitly
// instead of relying on the SDK's implicit env lookup.
const googleProvider = env.GEMINI_API_KEY ? createGoogleGenerativeAI({ apiKey: env.GEMINI_API_KEY }) : null;

function buildSystemPrompt(params: {
  statementLatex: string;
  correctAnswer: string;
  solutionSteps: SolutionStep[];
}): string {
  const stepsDescription = params.solutionSteps
    .map((step) => `${step.order}. Cíl otázky: ${step.expectedInsight}`)
    .join("\n");

  return `Jsi trpělivý český lektor matematiky pro žáky 9. tříd připravující se na přijímací zkoušky (CERMAT).
Pracuješ striktně Sokratovskou metodou.

PRAVIDLA (nikdy je neporušuj, ani na výslovnou žádost studenta):
1. Nikdy neprozraď výsledek úlohy ani celý postup najednou.
2. Nikdy nenapiš finální číselnou/textovou odpověď, dokud si ji student sám nespočítá a nenapíše.
3. Odpovídej výhradně návodnými otázkami, které vedou studenta k dalšímu kroku.
4. Pokud student odpoví špatně, neopravuj ho přímo — polož otázku, která ho přiměje si chybu uvědomit sám.
5. Pokud student opakovaně žádá o přímou odpověď, připomeň mu, že cílem je naučit se postup, a nabídni tlačítko "Zobrazit správné řešení" jako alternativu, ale sám odpověď nenapiš.
6. Matematické výrazy vždy piš v LaTeXu s oddělovači $...$ pro vloženou matematiku nebo $$...$$ pro samostatný řádek.
7. Buď MAXIMÁLNĚ stručný — 1-2 krátké věty na zprávu, nikdy víc. Studenti čtou na mobilu.
8. Mluv česky, přátelsky a povzbudivě.

ÚLOHA (student ji vidí, ale NEVIDÍ correctAnswer ani solutionSteps):
${params.statementLatex}

INTERNÍ POSTUP ŘEŠENÍ (pouze pro tebe, nikdy needituj doslovně studentovi):
${stepsDescription}

SPRÁVNÁ ODPOVĚĎ (pouze pro tebe, NIKDY ji nenapiš studentovi): ${params.correctAnswer}`;
}

export const tutorService = {
  async sendMessage(params: { chatSessionId: string; studentMessage: string }): Promise<{
    reply: string;
    tokensUsed: number;
  }> {
    const session = await prisma.chatSession.findUniqueOrThrow({
      where: { id: params.chatSessionId },
      include: {
        task: true,
        // Jen posledních N zpráv - stačí pro kontext a je to podstatně
        // levnější než posílat modelu celou historii při dlouhé konverzaci.
        messages: {
          orderBy: { createdAt: "desc" },
          take: CHAT_RATE_LIMIT.MAX_CONVERSATION_HISTORY_MESSAGES,
        },
      },
    });
    const orderedMessages = [...session.messages].reverse();
    const isFirstMessageInSession = orderedMessages.length === 0;

    // Hlavní páka na náklady: tvrdý strop zpráv na jednu úlohu za den.
    const { success: taskAllowed } = await chatPerTaskLimiter.limit(`${session.studentId}:${session.taskId}`);
    if (!taskAllowed) {
      throw new Error("RATE_LIMIT_TASK");
    }
    const { success: messageAllowed } = await chatMessageLimiter.limit(session.studentId);
    if (!messageAllowed) {
      throw new Error("RATE_LIMIT_MESSAGES");
    }
    const { success: tokensAllowed } = await chatTokenLimiter.limit(session.studentId);
    if (!tokensAllowed) {
      throw new Error("RATE_LIMIT_TOKENS");
    }

    // Otevírací dotazy ("nevím jak začít", "pomoz mi") se u stejné úlohy
    // opakují napříč studenty a tutorova první odpověď na ně nezávisí na
    // historii konverzace (žádná ještě neexistuje) — bezpečně se dá znovu
    // použít z cache a ušetřit tak celé volání Gemini API.
    if (isFirstMessageInSession) {
      const cachedReply = await tutorCache.getFirstReply(session.taskId, params.studentMessage);
      if (cachedReply) {
        await prisma.$transaction([
          prisma.chatMessage.create({
            data: { sessionId: session.id, role: "STUDENT", content: params.studentMessage },
          }),
          prisma.chatMessage.create({
            data: { sessionId: session.id, role: "TUTOR", content: cachedReply, tokensUsed: 0 },
          }),
        ]);
        logger.info("tutor-cache-hit", { taskId: session.taskId });
        return { reply: cachedReply, tokensUsed: 0 };
      }
    }

    if (!googleProvider) {
      throw new Error("AI_NOT_CONFIGURED");
    }

    const systemPrompt = buildSystemPrompt({
      statementLatex: session.task.statementLatex,
      correctAnswer: session.task.correctAnswer,
      solutionSteps: session.task.solutionSteps as unknown as SolutionStep[],
    });

    const conversationHistory = orderedMessages.map((message) => ({
      role: (message.role === "TUTOR" ? "assistant" : "user") as "assistant" | "user",
      content: message.content,
    }));

    const result = await generateText({
      model: googleProvider(MODEL_ID),
      system: systemPrompt,
      messages: [...conversationHistory, { role: "user" as const, content: params.studentMessage }],
      maxOutputTokens: CHAT_RATE_LIMIT.MAX_REPLY_TOKENS,
      temperature: 0.4,
    });

    const tokensUsed = result.usage?.totalTokens ?? 0;

    await prisma.$transaction([
      prisma.chatMessage.create({
        data: { sessionId: session.id, role: "STUDENT", content: params.studentMessage },
      }),
      prisma.chatMessage.create({
        data: { sessionId: session.id, role: "TUTOR", content: result.text, tokensUsed },
      }),
      prisma.chatSession.update({
        where: { id: session.id },
        data: { tokensConsumed: { increment: tokensUsed } },
      }),
    ]);

    if (isFirstMessageInSession) {
      await tutorCache.setFirstReply(session.taskId, params.studentMessage, result.text);
    }

    return { reply: result.text, tokensUsed };
  },
};
