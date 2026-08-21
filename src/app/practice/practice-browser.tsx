"use client";

import * as React from "react";
import Link from "next/link";
import type { TaskDifficulty, TaskTopic } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { KaTeXRenderer } from "@/components/ui/katex-renderer";
import { usePracticeTasks } from "@/hooks/use-practice-tasks";
import { DIFFICULTY_BADGE_VARIANT, DIFFICULTY_LABELS, TOPIC_LABELS } from "@/constants";
import { cn } from "@/lib/utils";

const TOPICS = Object.entries(TOPIC_LABELS) as Array<[TaskTopic, string]>;
const DIFFICULTIES = Object.entries(DIFFICULTY_LABELS) as Array<[TaskDifficulty, string]>;

export function PracticeBrowser(): React.JSX.Element {
  const [topic, setTopic] = React.useState<TaskTopic | undefined>(undefined);
  const [difficulty, setDifficulty] = React.useState<TaskDifficulty | undefined>(undefined);

  const { data: tasks, isLoading, isError } = usePracticeTasks({ topic, difficulty });

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTopic(undefined)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            !topic ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border text-muted-foreground",
          )}
        >
          Všechna témata
        </button>
        {TOPICS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTopic(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              topic === value ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setDifficulty(undefined)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            !difficulty ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border text-muted-foreground",
          )}
        >
          Libovolná obtížnost
        </button>
        {DIFFICULTIES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setDifficulty(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              difficulty === value ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))
        ) : isError ? (
          <p className="col-span-2 text-sm text-danger-600">Úlohy se nepodařilo načíst. Zkus obnovit stránku.</p>
        ) : tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <Link key={task.id} href={`/practice/${task.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-2 flex gap-2">
                    <Badge>{TOPIC_LABELS[task.topic]}</Badge>
                    <Badge variant={DIFFICULTY_BADGE_VARIANT[task.difficulty]}>
                      {DIFFICULTY_LABELS[task.difficulty]}
                    </Badge>
                  </div>
                  <KaTeXRenderer content={task.statementLatex} className="line-clamp-3 text-sm" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p className="col-span-2 text-sm text-muted-foreground">Pro tento filtr zatím nemáme žádné úlohy.</p>
        )}
      </div>
    </div>
  );
}
