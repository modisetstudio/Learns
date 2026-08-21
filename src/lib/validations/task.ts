import { z } from "zod";

export const submitAnswerSchema = z.object({
  taskId: z.string().cuid(),
  submittedAnswer: z.string().min(1, "Zadejte odpověď").max(500),
  timeSpentSeconds: z.number().int().nonnegative().max(24 * 60 * 60),
  testSessionId: z.string().cuid().optional(),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const chatMessageSchema = z.object({
  chatSessionId: z.string().cuid(),
  content: z
    .string()
    .min(1, "Napište zprávu")
    .max(1000, "Zpráva je příliš dlouhá (max. 1000 znaků)")
    .transform((value) => value.trim()),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const taskFilterSchema = z.object({
  topic: z
    .enum([
      "CISLA_A_VYPOCTY",
      "ROVNICE_A_NEROVNICE",
      "VYRAZY",
      "GEOMETRIE_ROVINNA",
      "GEOMETRIE_PROSTOROVA",
      "SLOVNI_ULOHY",
      "FUNKCE_A_GRAFY",
      "STATISTIKA_A_PRAVDEPODOBNOST",
      "FINANCNI_MATEMATIKA",
      "LOGIKA_A_KOMBINATORIKA",
    ])
    .optional(),
  difficulty: z.enum(["ZAKLADNI", "STREDNI", "POKROCILA"]).optional(),
  onlyUnsolved: z.boolean().default(false),
});

export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

export const adminTaskSchema = z.object({
  externalCode: z.string().min(1).max(64).optional(),
  year: z.number().int().min(2015).max(2100),
  term: z.enum(["RADNY_1", "RADNY_2", "NAHRADNI_1", "NAHRADNI_2", "ILUSTRACNI"]),
  topic: z.enum([
    "CISLA_A_VYPOCTY",
    "ROVNICE_A_NEROVNICE",
    "VYRAZY",
    "GEOMETRIE_ROVINNA",
    "GEOMETRIE_PROSTOROVA",
    "SLOVNI_ULOHY",
    "FUNKCE_A_GRAFY",
    "STATISTIKA_A_PRAVDEPODOBNOST",
    "FINANCNI_MATEMATIKA",
    "LOGIKA_A_KOMBINATORIKA",
  ]),
  difficulty: z.enum(["ZAKLADNI", "STREDNI", "POKROCILA"]),
  statementLatex: z.string().min(1, "Zadejte znění úlohy"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().max(200).optional(),
  correctAnswer: z.string().min(1, "Zadejte správnou odpověď"),
  answerFormat: z.enum(["text", "number", "choice"]),
  choices: z.array(z.string()).optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(true),
});

export type AdminTaskInput = z.infer<typeof adminTaskSchema>;
