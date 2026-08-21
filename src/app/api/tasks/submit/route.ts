import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { taskRepository } from "@/lib/repositories/task.repository";
import { studentRepository } from "@/lib/repositories/student.repository";
import { submitAnswerSchema } from "@/lib/validations/task";

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getSessionUser("STUDENT");

  const body: unknown = await request.json();
  const parsed = submitAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
  }

  const profile = await studentRepository.findProfileByUserId(user.id);
  const task = await taskRepository.findByIdWithAnswer(parsed.data.taskId);

  const isCorrect = normalizeAnswer(task.correctAnswer) === normalizeAnswer(parsed.data.submittedAnswer);

  await studentRepository.recordAttempt({
    studentId: profile.id,
    taskId: task.id,
    submittedAnswer: parsed.data.submittedAnswer,
    isCorrect,
    hintsUsedCount: 0,
    revealedSolution: false,
    timeSpentSeconds: parsed.data.timeSpentSeconds,
    ...(parsed.data.testSessionId ? { testSessionId: parsed.data.testSessionId } : {}),
  });

  return NextResponse.json({ isCorrect });
}
