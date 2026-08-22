import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { env } from "@/config/env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// Typ pole providers odvozujeme přímo z parametru funkce NextAuth() místo
// importu `Provider` z "@auth/core/providers" - v node_modules totiž existují
// DVĚ kopie @auth/core (jedna nahoře, jedna zanořená v next-auth/node_modules),
// protože @auth/prisma-adapter a next-auth si každý táhnou vlastní verzi.
// Import z vršku by se pak neshodoval s tím, co interně čeká
// next-auth/providers/credentials (typová kolize "dvou stejných, ale different
// instance" typů). Odvozením z NextAuth() samotné se tomuhle problému
// vyhneme úplně.
type NextAuthConfigParam = Parameters<typeof NextAuth>[0];
type NextAuthConfigObject = Exclude<NextAuthConfigParam, (...args: never[]) => unknown>;
type NextAuthProviders = NonNullable<NextAuthConfigObject["providers"]>;

const providers: NextAuthProviders = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Heslo", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = loginSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

// Google OAuth a magic-link e-maily jsou volitelné - bez klíčů v .env se
// příslušná tlačítka na /login prostě nezobrazí (viz login-form.tsx), místo
// aby aplikace při startu spadla.
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
  providers.push(
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.RESEND_FROM_EMAIL,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login/zkontrolujte-email",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
