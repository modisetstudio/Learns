"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

const RULES = [
  { icon: Clock, text: "Časový limit je 70 minut, přesně jako u ostré zkoušky." },
  { icon: ListChecks, text: "Test obsahuje 15 náhodně vybraných úloh z různých témat." },
  { icon: AlertCircle, text: "Po odevzdání (nebo vypršení času) se test automaticky vyhodnotí." },
];

export default function TestIntroPage(): React.JSX.Element {
  const router = useRouter();
  const [isStarting, setIsStarting] = React.useState(false);

  async function handleStart(): Promise<void> {
    setIsStarting(true);
    try {
      const response = await fetch("/api/test-sessions", { method: "POST" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(body.error ?? "Test se nepodařilo spustit.");
        return;
      }
      const { id } = (await response.json()) as { id: string };
      router.push(`/practice/test/${id}`);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <main className="container flex min-h-[70dvh] max-w-md flex-col items-center justify-center py-10 text-center">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-8">
          <h1 className="font-display text-2xl font-bold">Ostrý test nanečisto</h1>
          <ul className="w-full space-y-3 text-left text-sm text-muted-foreground">
            {RULES.map((rule) => (
              <li key={rule.text} className="flex items-start gap-2">
                <rule.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
                {rule.text}
              </li>
            ))}
          </ul>
          <Button className="w-full" size="lg" isLoading={isStarting} onClick={() => void handleStart()}>
            Spustit test
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
