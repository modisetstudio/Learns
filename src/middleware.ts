import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const ROLE_PREFIXES: Record<string, "STUDENT" | "ADMIN"> = {
  "/dashboard": "STUDENT",
  "/practice": "STUDENT",
  "/admin": "ADMIN",
};

// ============================================================================
// DOČASNĚ VYPNUTO: RBAC ochrana rout podle přihlášení
// ----------------------------------------------------------------------------
// Na výslovné přání zatím nemá aplikace vyžadovat přihlášení (login/register
// obrazovky nejsou zapojené do UI). Server-side ochrana rolí (`STUDENT` /
// `ADMIN`) se teď řeší v `src/lib/session.ts`, který místo
// přesměrování na /login dočasně použije seedovaného demo uživatele.
//
// Logika níže je plně funkční a stačí ji odkomentovat (a smazat fallback
// v `src/lib/session.ts`), jakmile se přihlašování zapojí zpět do UI.
// ============================================================================
export default auth((_req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) => {
  return NextResponse.next();

  /*
  const { pathname } = req.nextUrl;
  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) => pathname.startsWith(prefix));

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = ROLE_PREFIXES[matchedPrefix];
  if (requiredRole && session.user.role !== requiredRole) {
    return NextResponse.redirect(new URL("/nepovoleny-pristup", req.nextUrl.origin));
  }

  return NextResponse.next();
  */
});

export const config = {
  matcher: ["/dashboard/:path*", "/practice/:path*", "/admin/:path*"],
};
