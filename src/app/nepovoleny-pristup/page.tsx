import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Nepovolený přístup" };

export default function UnauthorizedPage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="h-12 w-12 text-danger-500" aria-hidden="true" />
      <h1 className="font-display text-xl font-bold">Nemáte oprávnění k této stránce</h1>
      <p className="max-w-sm text-muted-foreground">
        Tato část aplikace je určena jiné roli uživatele. Pokud si myslíte, že jde o chybu, kontaktujte podporu.
      </p>
      <Button asChild>
        <Link href="/">Zpět na úvod</Link>
      </Button>
    </main>
  );
}
