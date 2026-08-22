"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  React.useEffect(() => {
    console.error("Chyba stránky:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-danger-500" aria-hidden="true" />
      <h2 className="text-lg font-bold">Tuto stránku se nepodařilo načíst</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Zkuste to prosím znovu. Pokud problém přetrvává, kontaktujte podporu.
      </p>
      <Button onClick={() => reset()}>Zkusit znovu</Button>
    </main>
  );
}
