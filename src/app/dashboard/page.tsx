import Link from "next/link";
import { Flame, Trophy, Target, PlayCircle } from "lucide-react";

import { getSessionUser } from "@/lib/session";
import { studentRepository } from "@/lib/repositories/student.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TOPIC_LABELS } from "@/constants";

export const metadata = { title: "Přehled" };

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const user = await getSessionUser("STUDENT");

  const profile = await studentRepository.findProfileByUserId(user.id);
  const stats = await studentRepository.getDashboardData(profile.id);

  return (
    <main className="container max-w-5xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Ahoj, {user.name}! 👋</h1>
          <p className="mt-1 text-muted-foreground">Tady je tvůj přehled pokroku.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/practice">
              <PlayCircle className="h-4 w-4" /> Procvičovat
            </Link>
          </Button>
          <Button asChild>
            <Link href="/practice/test">Spustit ostrý test</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-warning-50 p-3">
              <Flame className="h-6 w-6 text-warning-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.currentStreak} dní</p>
              <p className="text-sm text-muted-foreground">Aktuální série</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary-50 p-3">
              <Trophy className="h-6 w-6 text-primary-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalXp} XP</p>
              <p className="text-sm text-muted-foreground">Nejdelší série: {stats.longestStreak} dní</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-success-50 p-3">
              <Target className="h-6 w-6 text-success-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.weeklyCorrect}/{stats.weeklyAttempted}
              </p>
              <p className="text-sm text-muted-foreground">Správně tento týden</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Úspěšnost podle témat</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topicStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Zatím nemáš žádné vyřešené úlohy. Začni procvičováním a statistiky se tu objeví.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.topicStats.map((topic) => (
                <li key={topic.topic} className="flex items-center gap-3">
                  <span className="w-48 shrink-0 text-sm">{TOPIC_LABELS[topic.topic]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all"
                      style={{ width: `${topic.accuracy}%` }}
                    />
                  </div>
                  <Badge variant={topic.accuracy >= 70 ? "success" : topic.accuracy >= 40 ? "warning" : "danger"}>
                    {topic.accuracy}&nbsp;%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
