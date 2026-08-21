"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Timer } from "@/components/ui/timer";
import { KaTeXRenderer } from "@/components/ui/katex-renderer";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { TOPIC_LABELS } from "@/constants";
import type { TaskWithoutAnswer } from "@/types";

interface SessionTaskEntry {
  orderIndex: number;
  task: TaskWithoutAnswer;
}

interface SessionData {
  id: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  timeLimitSeconds: number;
  startedAt: string;
  tasks: SessionTaskEntry[];
}

async function fetchSession(sessionId: string): Promise<SessionData> {
  const response = await fetch(`/api/test-sessions/${sessionId}`);
  if (!response.ok) throw new Error("Nepodařilo se načíst test.");
  return (await response.json()) as SessionData;
}

async function completeSession(sessionId: string, answers: Record<string, string>) {
  const response = await fetch(`/api/test-sessions/${sessionId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) throw new Error("Test se nepodařilo odeslat.");
  return (await response.json()) as { scoreCorrect: number; scoreTotal: number };
}

export function ExamRunner({ sessionId }: { sessionId: string }): React.JSX.Element {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["test-session", sessionId], queryFn: () => fetchSession(sessionId) });

  const completeMutation = useMutation({
    mutationFn: (finalAnswers: Record<string, string>) => completeSession(sessionId, finalAnswers),
    onSuccess: (result) => {
      router.push(`/practice/test/${sessionId}/results?correct=${result.scoreCorrect}&total=${result.scoreTotal}`);
    },
    onError: () => toast.error("Test se nepodařilo odeslat, zkus to prosím znovu."),
  });

  React.useEffect(() => {
    if (!data) return;
    const startedAtMs = new Date(data.startedAt).getTime();
    const tick = (): void => {
      const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
      setRemainingSeconds(Math.max(data.timeLimitSeconds - elapsed, 0));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleExpireOrSubmit = React.useCallback(() => {
    if (completeMutation.isPending || completeMutation.isSuccess) return;
    completeMutation.mutate(answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, completeMutation.isPending, completeMutation.isSuccess]);

  if (isLoading || !data) {
    return <div className="container py-10 text-sm text-muted-foreground">Načítám test…</div>;
  }

  const currentEntry = data.tasks[activeIndex];
  const answeredCount = Object.keys(answers).filter((key) => answers[key]?.trim()).length;

  return (
    <main className="container max-w-4xl py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold">Ostrý test nanečisto</h1>
          <p className="text-sm text-muted-foreground">
            Zodpovězeno {answeredCount} z {data.tasks.length}
          </p>
        </div>
        {remainingSeconds !== null ? (
          <Timer totalSeconds={data.timeLimitSeconds} remainingSeconds={remainingSeconds} onExpire={handleExpireOrSubmit} />
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {data.tasks.map((entry, index) => {
          const isAnswered = Boolean(answers[entry.task.id]?.trim());
          return (
            <button
              key={entry.task.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                index === activeIndex && "border-primary-600 ring-2 ring-primary-200",
                isAnswered ? "border-success-300 bg-success-50 text-success-700" : "border-border text-muted-foreground",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {currentEntry ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <Badge className="mb-3">{TOPIC_LABELS[currentEntry.task.topic]}</Badge>
          <KaTeXRenderer content={currentEntry.task.statementLatex} className="text-base" />
          {currentEntry.task.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentEntry.task.imageUrl}
              alt={currentEntry.task.imageAlt ?? "Obrázek k úloze"}
              className="mt-4 max-w-full rounded-lg border border-border"
            />
          ) : null}
          <div className="mt-4">
            <Input
              label={`Odpověď na úlohu ${activeIndex + 1}`}
              value={answers[currentEntry.task.id] ?? ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [currentEntry.task.id]: event.target.value }))
              }
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
        >
          Předchozí
        </Button>
        {activeIndex < data.tasks.length - 1 ? (
          <Button type="button" onClick={() => setActiveIndex((i) => Math.min(data.tasks.length - 1, i + 1))}>
            Další úloha
          </Button>
        ) : (
          <Button type="button" isLoading={completeMutation.isPending} onClick={handleExpireOrSubmit}>
            Odevzdat test
          </Button>
        )}
      </div>
    </main>
  );
}
