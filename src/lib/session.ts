import type { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { SessionUser } from "@/types";

/**
 * ============================================================================
 * DOČASNÝ OBCHOD KOLEM PŘIHLÁŠENÍ (DEV-ONLY AUTH BYPASS)
 * ============================================================================
 * Na výslovné přání zatím nechceme nutit uživatele procházet přihlašovací
 * obrazovku, dokud se ladí zbytek aplikace. Auth.js, `middleware.ts` i login/
 * register formuláře zůstávají plně funkční a připravené — RBAC ochrana rout
 * je jen v `middleware.ts` dočasně vypnutá (viz komentář tamtéž).
 *
 * Tahle funkce nahrazuje `auth()` na všech místech, která potřebují vědět,
 * "kdo je přihlášen": pokud existuje skutečná session, použije se. Pokud ne,
 * spadne zpátky na prvního seedovaného uživatele odpovídající role
 * (`npm run db:seed`), aby stránky i API šly procházet bez přihlášení.
 *
 * PŘED NASAZENÍM DO OSTRÉHO PROVOZU:
 * 1) smažte tento fallback (nechte jen `session?.user`),
 * 2) v `middleware.ts` znovu zapněte redirect na `/login`,
 * 3) do UI přidejte odkazy na `/login` a `/register` (např. do horní lišty).
 * ============================================================================
 */
export async function getSessionUser(requiredRole: UserRole): Promise<SessionUser> {
  const session = await auth();
  if (session?.user) {
    return session.user;
  }

  logger.warn("auth-bypass-active: používá se demo uživatel místo přihlášení", { requiredRole });

  const demoUser = await prisma.user.findFirst({
    where: { role: requiredRole },
    orderBy: { createdAt: "asc" },
  });

  if (!demoUser) {
    throw new Error(
      `Žádný uživatel s rolí ${requiredRole} nebyl v databázi nalezen. Spusťte 'npm run db:seed' a zkuste to znovu.`,
    );
  }

  return {
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email,
    role: demoUser.role,
    image: demoUser.image,
  };
}

/** Vrátí session uživatele, pokud existuje, jinak `null` (bez povinné role). */
export async function getOptionalSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}
