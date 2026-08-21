"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KaTeXRenderer } from "@/components/ui/katex-renderer";
import { toast } from "@/components/ui/toast";
import { TOPIC_LABELS, DIFFICULTY_LABELS } from "@/constants";
import { adminTaskSchema, type AdminTaskInput } from "@/lib/validations/task";
import { createTaskAction } from "@/lib/actions/admin.actions";

const TOPICS = Object.entries(TOPIC_LABELS);
const DIFFICULTIES = Object.entries(DIFFICULTY_LABELS);
const TERMS: Array<[string, string]> = [
  ["RADNY_1", "Řádný termín 1"],
  ["RADNY_2", "Řádný termín 2"],
  ["NAHRADNI_1", "Náhradní termín 1"],
  ["NAHRADNI_2", "Náhradní termín 2"],
  ["ILUSTRACNI", "Ilustrační test"],
];

export function AdminTaskForm(): React.JSX.Element {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminTaskInput>({
    resolver: zodResolver(adminTaskSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      term: "RADNY_1",
      topic: "ROVNICE_A_NEROVNICE",
      difficulty: "STREDNI",
      answerFormat: "text",
      isPublished: true,
      statementLatex: "",
      correctAnswer: "",
    },
  });

  const statementPreview = watch("statementLatex");

  async function onSubmit(data: AdminTaskInput): Promise<void> {
    const result = await createTaskAction(data);
    if (!result.success) {
      toast.error(result.error ?? "Úlohu se nepodařilo uložit.");
      return;
    }
    toast.success("Úloha byla přidána.");
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Přidat novou úlohu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 md:grid-cols-2">
          <Input label="Externí kód (volitelné)" {...register("externalCode")} />
          <Input label="Rok" type="number" errorMessage={errors.year?.message} {...register("year", { valueAsNumber: true })} />

          <div>
            <label className="mb-1.5 block text-sm font-medium">Termín</label>
            <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" {...register("term")}>
              {TERMS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Téma</label>
            <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" {...register("topic")}>
              {TOPICS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Obtížnost</label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              {...register("difficulty")}
            >
              {DIFFICULTIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Formát odpovědi</label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              {...register("answerFormat")}
            >
              <option value="text">Text</option>
              <option value="number">Číslo</option>
              <option value="choice">Výběr z možností</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              Znění úlohy (LaTeX, matematiku obalte $...$ nebo $$...$$)
            </label>
            <Controller
              control={control}
              name="statementLatex"
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                  placeholder="Vypočítejte: $$x^2 - 5x + 6 = 0$$"
                />
              )}
            />
            {errors.statementLatex ? (
              <p className="mt-1 text-sm text-danger-600">{errors.statementLatex.message}</p>
            ) : null}
            {statementPreview ? (
              <div className="mt-2 rounded-lg bg-muted p-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Náhled:</p>
                <KaTeXRenderer content={statementPreview} />
              </div>
            ) : null}
          </div>

          <Input label="Obrázek – URL (volitelné)" {...register("imageUrl")} />
          <Input label="Alternativní text obrázku" {...register("imageAlt")} />

          <Input
            label="Správná odpověď"
            errorMessage={errors.correctAnswer?.message}
            {...register("correctAnswer")}
          />
          <Input label="Zdrojový odkaz (CERMAT PDF)" {...register("sourceUrl")} />

          <div className="md:col-span-2">
            <Button type="submit" isLoading={isSubmitting}>
              Uložit úlohu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
