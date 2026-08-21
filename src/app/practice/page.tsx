import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PracticeBrowser } from "./practice-browser";

export const metadata = { title: "Procvičování" };

export default function PracticePage(): React.JSX.Element {
  return (
    <main className="container max-w-5xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Procvičování úloh</h1>
          <p className="mt-1 text-muted-foreground">Vyber si téma a obtížnost, nebo si zkus ostrý test na čas.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/practice/test">Spustit ostrý test (70 min)</Link>
        </Button>
      </div>

      <div className="mt-8">
        <PracticeBrowser />
      </div>
    </main>
  );
}
