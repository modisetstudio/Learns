"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Neošetřená chyba aplikace:", error);
  }, [error]);

  return (
    <html lang="cs">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-danger-500" aria-hidden="true" />
          <h1 className="text-xl font-bold">Něco se pokazilo</h1>
          <p className="max-w-sm text-muted-foreground">
            Omlouváme se, došlo k neočekávané chybě. Zkuste to prosím znovu.
          </p>
          <Button onClick={() => reset()}>Zkusit znovu</Button>
        </main>
      </body>
    </html>
  );
}
