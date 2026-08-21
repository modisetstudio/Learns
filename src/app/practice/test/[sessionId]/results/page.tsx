import Link from "next/link";
import { Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Výsledky testu" };

interface ResultsPageProps {
  searchParams: Promise<{ correct?: string; total?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps): Promise<React.JSX.Element> {
  const { correct, total } = await searchParams;
  const correctCount = Number(correct ?? 0);
  const totalCount = Number(total ?? 0);
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <main className="container flex min-h-[70dvh] max-w-md flex-col items-center justify-center py-10 text-center">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-8">
          <Trophy className="h-12 w-12 text-warning-500" aria-hidden="true" />
          <h1 className="font-display text-2xl font-bold">Test dokončen!</h1>
          <p className="text-4xl font-bold text-primary-600">
            {correctCount} / {totalCount}
          </p>
          <p className="text-muted-foreground">Úspěšnost {percentage} %</p>
          <div className="mt-4 flex w-full gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">Na přehled</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/practice/test">Zkusit znovu</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
