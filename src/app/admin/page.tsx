import { BookOpen, Users, Activity, Cpu } from "lucide-react";

import { adminRepository } from "@/lib/repositories/admin.repository";
import { Card, CardContent } from "@/components/ui/card";
import { AdminTaskForm } from "./admin-task-form";
import { AdminTaskTable } from "./admin-task-table";

export const metadata = { title: "Administrace" };

export default async function AdminDashboardPage(): Promise<React.JSX.Element> {
  const [stats, tasks] = await Promise.all([adminRepository.getStats(), adminRepository.listTasks()]);

  const statCards = [
    { icon: BookOpen, label: "Úloh v databázi", value: stats.totalTasks },
    { icon: Users, label: "Registrovaných žáků", value: stats.totalStudents },
    { icon: Activity, label: "Celkem pokusů o řešení", value: stats.totalAttempts },
    { icon: Cpu, label: "Tokenů dnes (AI tutor)", value: stats.tokensUsedToday.toLocaleString("cs-CZ") },
  ];

  return (
    <main className="container max-w-6xl py-10">
      <h1 className="font-display text-2xl font-bold">Administrace</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <card.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              <div>
                <p className="text-xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <AdminTaskForm />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold">Databáze úloh</h2>
        <AdminTaskTable initialTasks={tasks} />
      </div>
    </main>
  );
}
