"use client";

import * as React from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KaTeXRenderer } from "@/components/ui/katex-renderer";
import { toast } from "@/components/ui/toast";
import { TOPIC_LABELS, DIFFICULTY_LABELS, DIFFICULTY_BADGE_VARIANT } from "@/constants";
import { togglePublishAction, deleteTaskAction } from "@/lib/actions/admin.actions";
import type { TaskDifficulty, TaskTopic, ExamTerm } from "@prisma/client";

interface AdminTaskRow {
  id: string;
  externalCode: string | null;
  year: number;
  term: ExamTerm;
  topic: TaskTopic;
  difficulty: TaskDifficulty;
  isPublished: boolean;
  statementLatex: string;
}

export function AdminTaskTable({ initialTasks }: { initialTasks: AdminTaskRow[] }): React.JSX.Element {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleTogglePublish(task: AdminTaskRow): Promise<void> {
    setPendingId(task.id);
    const result = await togglePublishAction(task.id, !task.isPublished);
    if (result.success) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, isPublished: !t.isPublished } : t)));
    } else {
      toast.error(result.error ?? "Akci se nepodařilo provést.");
    }
    setPendingId(null);
  }

  async function handleDelete(task: AdminTaskRow): Promise<void> {
    if (!confirm(`Opravdu smazat úlohu ${task.externalCode ?? task.id}?`)) return;
    setPendingId(task.id);
    const result = await deleteTaskAction(task.id);
    if (result.success) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } else {
      toast.error(result.error ?? "Smazání se nepodařilo.");
    }
    setPendingId(null);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Úloha</th>
            <th className="px-4 py-3">Téma</th>
            <th className="px-4 py-3">Obtížnost</th>
            <th className="px-4 py-3">Rok</th>
            <th className="px-4 py-3">Stav</th>
            <th className="px-4 py-3 text-right">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="max-w-xs px-4 py-3">
                <KaTeXRenderer content={task.statementLatex} className="line-clamp-2 text-xs" />
              </td>
              <td className="px-4 py-3 text-xs">{TOPIC_LABELS[task.topic]}</td>
              <td className="px-4 py-3">
                <Badge variant={DIFFICULTY_BADGE_VARIANT[task.difficulty]}>{DIFFICULTY_LABELS[task.difficulty]}</Badge>
              </td>
              <td className="px-4 py-3 text-xs">{task.year}</td>
              <td className="px-4 py-3">
                <Badge variant={task.isPublished ? "success" : "muted"}>
                  {task.isPublished ? "Publikováno" : "Skryto"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pendingId === task.id}
                    onClick={() => void handleTogglePublish(task)}
                    aria-label={task.isPublished ? "Skrýt úlohu" : "Publikovat úlohu"}
                  >
                    {task.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={pendingId === task.id}
                    onClick={() => void handleDelete(task)}
                    aria-label="Smazat úlohu"
                  >
                    <Trash2 className="h-4 w-4 text-danger-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">Zatím žádné úlohy. Přidejte první výše.</p>
      ) : null}
    </div>
  );
}
