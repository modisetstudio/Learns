# Přijímačky Lehce

Interaktivní PWA pro přípravu žáků 9. tříd na CERMAT přijímací zkoušky z matematiky. AI tutor pracuje
Sokratovskou metodou — nikdy nevyzradí výsledek, ale návodnými otázkami vede studenta k vlastnímu řešení.

## Tech stack

- **Next.js 15** (App Router), React 19, TypeScript (strict)
- **Tailwind CSS** + vlastní design systém (`src/components/ui`)
- **Prisma** + PostgreSQL (Supabase)
- **Auth.js v5** — přihlášení heslem, Google OAuth, magic link (Resend)
- **Gemini API** (`ai` SDK) — Sokratovský AI tutor
- **Upstash Redis** — rate limiting AI chatu a API
- **TanStack Query** (server state), **Zustand** (client state), **React Hook Form + Zod** (formuláře)
- **Vitest** (unit), **Playwright** (E2E), **GitHub Actions** (CI)

> **Platby (Stripe)**: databázové schéma je připravené (`Subscription` model), ale checkout/webhook
> logika se doplní jako poslední krok projektu — podle domluvy.

## Struktura projektu

```
src/
  app/                 # routy (App Router) - stránky + API endpoints
  components/
    ui/                # design systém (Button, Input, Card, Modal, KaTeXRenderer, Timer...)
    practice/           # komponenty specifické pro procvičování (chat, odpovědní panel)
  lib/
    repositories/       # Repository Pattern - veškerý přístup k DB
    services/            # business logika (AI tutor)
    validations/         # Zod schémata
    actions/              # Next.js Server Actions
  hooks/                # TanStack Query hooks
  store/                # Zustand store
  types/                # sdílené TS typy
  config/               # env validace
  constants/            # labely, limity, konfigurace
prisma/
  schema.prisma         # DB schéma
  seed.ts                # ukázková data (admin účet, demo žák, ukázkové úlohy)
```

## Lokální spuštění

### Nejrychlejší start (bez zakládání účtů)

```bash
npm install
cp .env.example .env
docker compose up -d      # spustí lokální Postgres na portu 5432
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

`.env.example` má `DATABASE_URL` už přednastavené na tenhle lokální Postgres, takže
stačí jen zkopírovat na `.env` beze změny. **Jediná proměnná, kterou aplikace opravdu
potřebuje, je `DATABASE_URL`** — vše ostatní (Google přihlášení, AI tutor, e-maily,
rate limiting) je volitelné a bez klíčů se jen ta konkrétní funkce nepoužije (viz
komentáře v `.env.example` a `src/config/env.ts`). AI chat bez `GEMINI_API_KEY` vrátí
srozumitelnou chybovou hlášku, ne pád aplikace.

### 1. Předpoklady

- Node.js 20+
- Docker (pro lokální Postgres) **nebo** účet na [Supabase](https://supabase.com) (zdarma)

### 2. Instalace

```bash
npm install
cp .env.example .env
```

`.env.example` obsahuje u každé proměnné komentář, jestli je povinná a odkud si vzít
klíč, pokud danou funkci chcete zapnout:

| Proměnná | Povinné? | Kde získat |
|---|---|---|
| `DATABASE_URL` | **Ano** | `docker compose up -d`, nebo [supabase.com](https://supabase.com) → Project Settings → Database |
| `NEXTAUTH_SECRET` | Ne (má dev fallback) | vygenerujte: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID/SECRET` | Ne | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GEMINI_API_KEY` | Ne | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `RESEND_API_KEY` | Ne | [resend.com](https://resend.com/api-keys) |
| `UPSTASH_REDIS_REST_URL/TOKEN` | Ne (má in-memory fallback) | [console.upstash.com](https://console.upstash.com) |

### 3. Databáze

```bash
docker compose up -d   # pokud nepoužíváte Supabase
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seed vytvoří:
- admin účet: `admin@prijimackylehce.cz` / `Admin1234`
- demo žákovský účet: `student@prijimackylehce.cz` / `Student1234`
- 18 ukázkových úloh napříč tématy a obtížností (vlastní originální zadání ve stylu ostrého
  testu JPZ — viz sekce Copyright níže)

> **Přihlašování je dočasně vypnuté.** `/dashboard`, `/practice` i `/admin` jdou otevřít bez
> přihlášení — server si pod kapotou vezme příslušný seedovaný demo účet (viz
> `src/lib/session.ts`). Login/register formuláře i celá Auth.js konfigurace zůstávají
> plně funkční, jen `middleware.ts` má vynucení dočasně zakomentované. Až budete chtít
> přihlašování zapnout zpět, návod je v komentáři na začátku `src/lib/session.ts`.

> **Aplikace je čistě pro studenty.** Rodičovský účet/dashboard byl záměrně odstraněn —
> existují jen role `STUDENT` a `ADMIN`.

### 4. Spuštění

```bash
npm run dev
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000).

## Testy

```bash
npm run test          # unit testy (Vitest)
npm run test:e2e       # E2E testy (Playwright) - vyžaduje `npm run build` a běžící DB
```

## Copyright a obsah úloh

CERMAT testová zadání (PDF na
[prijimacky.cermat.cz](https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika))
jsou explicitně označena jako předmět autorských práv Centra pro zjišťování výsledků vzdělávání.
Ukázkové úlohy v `prisma/seed.ts` proto **nejsou** doslovné kopie ostrých zadání — jsou to vlastní,
originální úlohy se stejným formátem, strukturou (otevřené/uzavřené úlohy, díly, tvrzení
pravda/nepravda) a obtížností, jaké jsem našel v testu 1. řádného termínu 2026.

Pokud chcete do databáze doplnit skutečná CERMAT zadání, doporučený postup:
1. Stáhněte si PDF přímo z prijimacky.cermat.cz.
2. Přepište úlohy sami přes admin panel (`/admin`) — formulář podporuje LaTeX i URL obrázku
   pro geometrická zadání.
3. Zvažte se svým právníkem, zda váš zamýšlený způsob použití (komerční SaaS s platícími
   uživateli) vyžaduje licenci od CERMATu, zejména pokud plánujete úlohy nabízet ve větším
   rozsahu než pro ryze osobní/vzdělávací potřebu.

## Bezpečnost

- Veškerá API i server actions ověřují session a roli (`STUDENT`/`PARENT`/`ADMIN`).
- `middleware.ts` chrání routy podle role ještě před vykreslením stránky.
- AI tutor nikdy nedostává `correctAnswer` do promptu viditelného studentovi a je chráněn
  rate limitem (zprávy/hod. i tokeny/den) přes Upstash Redis.
- CSP a bezpečnostní hlavičky jsou nastaveny v `next.config.mjs`.
