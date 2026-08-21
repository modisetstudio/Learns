import Link from "next/link";

import { LoginForm } from "./login-form";
import { APP_NAME } from "@/constants";

export const metadata = { title: "Přihlášení" };

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display text-xl font-bold text-primary-700">
            {APP_NAME}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">Přihlaste se ke svému účtu</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Nemáte účet?{" "}
          <Link href="/register" className="font-medium text-primary-600 hover:underline">
            Zaregistrujte se
          </Link>
        </p>
      </div>
    </main>
  );
}
