"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Eye, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KaTeXRenderer } from "@/components/ui/katex-renderer";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { DIFFICULTY_BADGE_VARIANT, DIFFICULTY_LABELS, TOPIC_LABELS } from "@/constants";
import type { TaskWithoutAnswer } from "@/types";

interface AnswerPanelProps {
  task: TaskWithoutAnswer;
  startedAt: number;
  nextTaskHref: string;
}

async function submitAnswer(payload: { taskId: string; submittedAnswer: string; timeSpentSeconds: number }) {
  const response = await fetch("/api/tasks/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Nepodařilo se odeslat odpověď.");
  return (await response.json()) as { isCorrect: boolean };
}

async function fetchRevealedSolution(taskId: string): Promise<{ correctAnswer: string }> {
  const response = await fetch(`/api/tasks/${taskId}/reveal`, { method: "POST" });
  if (!response.ok) throw new Error("Nepodařilo se načíst řešení.");
  return (await response.json()) as { correctAnswer: string };
}

interface TaskHint {
  order: number;
  socraticQuestion: string;
}

async function fetchHints(taskId: string): Promise<TaskHint[]> {
  const response = await fetch(`/api/tasks/${taskId}/hints`);
  if (!response.ok) throw new Error("Nápovědy se nepodařilo načíst.");
  const data = (await response.json()) as { hints: TaskHint[] };
  return data.hints;
}

export function AnswerPanel({ task, startedAt, nextTaskHref }: AnswerPanelProps): React.JSX.Element {
  const router = useRouter();
  const [answer, setAnswer] = React.useState("");
  const [result, setResult] = React.useState<"correct" | "incorrect" | null>(null);
  const [showSolutionModal, setShowSolutionModal] = React.useState(false);
  const [revealedAnswer, setRevealedAnswer] = React.useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data.isCorrect ? "correct" : "incorrect");
      if (data.isCorrect) toast.success("Správně! Skvělá práce.");
    },
    onError: () => toast.error("Něco se nepovedlo, zkus to prosím znovu."),
  });

  const revealMutation = useMutation({
    mutationFn: () => fetchRevealedSolution(task.id),
    onSuccess: (data) => setRevealedAnswer(data.correctAnswer),
    onError: () => toast.error("Řešení se nepodařilo načíst."),
  });

  const [hints, setHints] = React.useState<TaskHint[] | null>(null);
  const [hintsShown, setHintsShown] = React.useState(0);

  const hintsMutation = useMutation({
    mutationFn: () => fetchHints(task.id),
    onSuccess: (data) => {
      setHints(data);
      setHintsShown(1);
    },
    onError: () => toast.error("Nápovědy se nepodařilo načíst."),
  });

  function handleHintClick(): void {
    if (!hints) {
      hintsMutation.mutate();
      return;
    }
    setHintsShown((count) => Math.min(count + 1, hints.length));
  }

  const hasMoreHints = hints !== null && hintsShown < hints.length;

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (!answer.trim()) return;
    const timeSpentSeconds = Math.round((Date.now() - startedAt) / 1000);
    submitMutation.mutate({ taskId: task.id, submittedAnswer: answer, timeSpentSeconds });
  }

  function handleOpenSolution(): void {
    setShowSolutionModal(true);
    if (!revealedAnswer) revealMutation.mutate();
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 scrollbar-thin">
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge>{TOPIC_LABELS[task.topic]}</Badge>
        <Badge variant={DIFFICULTY_BADGE_VARIANT[task.difficulty]}>{DIFFICULTY_LABELS[task.difficulty]}</Badge>
      </div>

      <KaTeXRenderer content={task.statementLatex} className="text-lg" />

      {task.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={task.imageUrl}
          alt={task.imageAlt ?? "Obrázek k úloze"}
          className="mt-4 max-w-full rounded-lg border border-border"
        />
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <Input
          label="Tvoje odpověď"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={result === "correct"}
          placeholder="Zapiš výsledek…"
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={submitMutation.isPending} disabled={result === "correct"}>
            Zkontrolovat odpověď
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleHintClick}
            isLoading={hintsMutation.isPending}
            disabled={hints !== null && !hasMoreHints}
          >
            <Lightbulb className="h-4 w-4" />
            {hints === null ? "Nápověda (zdarma)" : hasMoreHints ? "Další nápověda" : "To byly všechny nápovědy"}
          </Button>
          <Button type="button" variant="outline" onClick={handleOpenSolution}>
            <Eye className="h-4 w-4" /> Zobrazit správný výsledek
          </Button>
        </div>
      </form>

      {hints && hintsShown > 0 ? (
        <div className="mt-4 space-y-2">
          {hints.slice(0, hintsShown).map((hint, index) => (
            <div key={hint.order} className="rounded-lg bg-primary-50 p-3 text-sm">
              <p className="mb-1 text-xs font-medium text-primary-600">
                Nápověda {index + 1}/{hints.length}
              </p>
              <KaTeXRenderer content={hint.socraticQuestion} className="text-primary-800" />
            </div>
          ))}
          {!hasMoreHints ? (
            <p className="text-xs text-muted-foreground">
              Došly ti volné nápovědy. Zkus se zeptat AI tutora vpravo — ten už reaguje přímo na to, co jsi zkusil/a.
            </p>
          ) : null}
        </div>
      ) : null}

      {result === "correct" ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-50 p-3 text-success-700">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">Správně! Pokračuj na další úlohu.</span>
          <Button size="sm" variant="link" onClick={() => router.push(nextTaskHref)}>
            Další úloha →
          </Button>
        </div>
      ) : result === "incorrect" ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger-50 p-3 text-danger-600">
          <XCircle className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">Zatím to není ono. Zkus se zeptat tutora vpravo.</span>
        </div>
      ) : null}

      <Modal open={showSolutionModal} onOpenChange={setShowSolutionModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Opravdu chceš vidět výsledek?</ModalTitle>
            <ModalDescription>
              Zkus se nejdřív zeptat AI tutora — často stačí jedna návodná otázka a přijdeš na to sám/sama.
            </ModalDescription>
          </ModalHeader>
          <div className="rounded-lg bg-muted p-3">
            {revealMutation.isPending ? (
              <p className="text-sm text-muted-foreground">Načítám…</p>
            ) : revealedAnswer ? (
              <KaTeXRenderer content={`Správný výsledek: $${revealedAnswer}$`} />
            ) : null}
          </div>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Zavřít</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
