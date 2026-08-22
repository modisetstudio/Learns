import { NextResponse, type NextRequest } from "next/server";

// ============================================================================
// DŮLEŽITÉ: tenhle soubor NESMÍ importovat nic z `@/lib/auth` (ani
// transitivně) — middleware běží na Vercelu v Edge Runtime, který nepodporuje
// Prisma Client ani bcrypt (oba vyžadují Node.js). Import `auth` z
// `@/lib/auth` sem celý tenhle Node.js-only kód natáhne a build/runtime na
// Vercelu spadne, i když se `auth()` fakticky nikdy nezavolá.
//
// Pokud budete chtít RBAC ochranu rout podle role zpátky (viz historie -
// `ROLE_PREFIXES` a redirect na /login), řešte to uvnitř jednotlivých
// server komponent / API routes (Node.js runtime, ne Edge) přes
// `src/lib/session.ts`, ne tady v middlewaru.
// ============================================================================
export function middleware(_req: NextRequest): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/practice/:path*", "/admin/:path*"],
};
