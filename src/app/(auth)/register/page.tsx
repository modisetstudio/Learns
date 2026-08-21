import Link from "next/link";

import { RegisterForm } from "./register-form";
import { APP_NAME } from "@/constants";

export const metadata = { title: "Registrace" };

export default function RegisterPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display text-xl font-bold text-primary-700">
            {APP_NAME}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">Vytvořte si nový účet</p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Už máte účet?{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            Přihlaste se
          </Link>
        </p>
      </div>
    </main>
  );
}
