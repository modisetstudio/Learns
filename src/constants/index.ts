import type { TaskDifficulty, TaskTopic } from "@prisma/client";

export const EXAM_TIME_LIMIT_SECONDS = 70 * 60;

export const TOPIC_LABELS: Record<TaskTopic, string> = {
  CISLA_A_VYPOCTY: "Čísla a výpočty",
  ROVNICE_A_NEROVNICE: "Rovnice a nerovnice",
  VYRAZY: "Výrazy",
  GEOMETRIE_ROVINNA: "Rovinná geometrie",
  GEOMETRIE_PROSTOROVA: "Prostorová geometrie",
  SLOVNI_ULOHY: "Slovní úlohy",
  FUNKCE_A_GRAFY: "Funkce a grafy",
  STATISTIKA_A_PRAVDEPODOBNOST: "Statistika a pravděpodobnost",
  FINANCNI_MATEMATIKA: "Finanční matematika",
  LOGIKA_A_KOMBINATORIKA: "Logika a kombinatorika",
};

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  ZAKLADNI: "Základní",
  STREDNI: "Střední",
  POKROCILA: "Pokročilá",
};

export const DIFFICULTY_BADGE_VARIANT: Record<TaskDifficulty, "success" | "warning" | "danger"> = {
  ZAKLADNI: "success",
  STREDNI: "warning",
  POKROCILA: "danger",
};

export const CHAT_RATE_LIMIT = {
  /** Tvrdý strop zpráv na jednu úlohu za den — nutí k rozumné konverzaci
   *  místo nekonečného chatování a je to nejúčinnější páka na náklady. */
  MAX_MESSAGES_PER_TASK_PER_DAY: 8,
  /** Bezpečnostní pojistka napříč celou aplikací (víc úloh za hodinu). */
  MAX_MESSAGES_PER_HOUR: 30,
  /** Celkový denní rozpočet tokenů na studenta. */
  MAX_TOKENS_PER_DAY: 40_000,
  WINDOW: "1 d" as const,
  /** Kolik posledních zpráv z historie se posílá modelu jako kontext —
   *  čím delší historie, tím dražší (a pomalejší) každý další dotaz. */
  MAX_CONVERSATION_HISTORY_MESSAGES: 8,
  /** Sokratovská odpověď má být 2-3 věty, ne esej — drží odpovědi krátké
   *  a tím i levné. */
  MAX_REPLY_TOKENS: 200,
  /** Kolik dní se v Redis drží cache pro první (nejčastěji obecnou)
   *  zprávu v konverzaci k dané úloze, viz tutor.service.ts. */
  FIRST_REPLY_CACHE_TTL_SECONDS: 60 * 60 * 24 * 30,
};

export const STREAK_GRACE_HOURS = 30;

export const APP_NAME = "Přijímačky Lehce";
export const APP_DESCRIPTION =
  "Příprava na CERMAT přijímací zkoušky z matematiky se Sokratovským AI tutorem.";
