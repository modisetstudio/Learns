import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { tutorService } from "@/lib/services/tutor.service";
import { chatMessageSchema } from "@/lib/validations/task";

export async function POST(request: Request): Promise<NextResponse> {
  await getSessionUser("STUDENT");

  const body: unknown = await request.json();
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná zpráva" }, { status: 400 });
  }

  try {
    const result = await tutorService.sendMessage({
      chatSessionId: parsed.data.chatSessionId,
      studentMessage: parsed.data.content,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT_TASK") {
      return NextResponse.json(
        {
          error:
            "Na téhle úloze jsi dnes vyčerpal/a limit zpráv pro AI tutora. Zkus úlohu vyřešit s tím, co už víš, nebo se mrkni na tlačítko „Zobrazit správný výsledek“.",
        },
        { status: 429 },
      );
    }
    if (error instanceof Error && error.message === "RATE_LIMIT_MESSAGES") {
      return NextResponse.json(
        { error: "Poslal/a jsi hodně zpráv za krátkou dobu. Chvíli počkej a zkus to znovu." },
        { status: 429 },
      );
    }
    if (error instanceof Error && error.message === "RATE_LIMIT_TOKENS") {
      return NextResponse.json(
        { error: "Dosáhl/a jsi dnešního limitu pro AI tutora. Zkus to zítra." },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: "AI tutor momentálně neodpovídá. Zkus to prosím znovu." }, { status: 502 });
  }
}
