import { z } from "zod";

// Bezpečný, ale zjevně "dev-only" fallback - používá se POUZE když
// NEXTAUTH_SECRET není v .env vůbec nastavené (typicky lokální vývoj bez
// dokončeného auth setupu). Před nasazením do produkce si vygenerujte
// vlastní: `openssl rand -base64 32`.
const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-do-not-use-in-production-32chars-min";

const envSchema = z.object({
  // Jediná proměnná, bez které aplikace opravdu nemůže fungovat - Prisma
  // potřebuje vědět, kam se připojit, pro úplně cokoliv kromě landing page.
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET musí mít alespoň 32 znaků")
    .default(DEV_FALLBACK_SECRET),

  // Google OAuth - volitelné. Bez těchto klíčů prostě jen nepůjde tlačítko
  // "Pokračovat s Google" (přihlašování je navíc zatím vypnuté, viz session.ts).
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // AI tutor - volitelné. Bez klíče vrátí chat API srozumitelnou chybu
  // místo pádu celé aplikace (viz tutor.service.ts).
  GEMINI_API_KEY: z.string().min(1).optional(),

  // Transakční e-maily - volitelné. Bez klíče magic-link přihlášení
  // jednoduše nepůjde použít.
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Rate limiting AI chatu - volitelné. Bez klíčů se automaticky použije
  // in-memory fallback limiter (viz rate-limit.ts) - funguje pro lokální
  // vývoj, ale NENÍ vhodný pro produkci s více instancemi serveru.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Platby - záměrně se řeší až na konci projektu.
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Neplatné proměnné prostředí:\n${formatted}\n\nZkontrolujte .env podle .env.example.`);
  }

  if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV !== "production") {
    console.warn(
      "[env] NEXTAUTH_SECRET není nastavené - používá se dočasná dev hodnota. " +
        "Před nasazením do produkce doplňte vlastní (openssl rand -base64 32).",
    );
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[env] GEMINI_API_KEY není nastavené - AI tutor zatím nebude odpovídat.");
  }
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    console.warn("[env] UPSTASH_REDIS_REST_URL není nastavené - rate limiting běží jen v paměti (dev-only).");
  }

  return parsed.data;
}

export const env = loadEnv();
