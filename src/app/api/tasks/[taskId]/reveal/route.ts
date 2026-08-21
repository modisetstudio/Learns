import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { taskRepository } from "@/lib/repositories/task.repository";
import { studentRepository } from "@/lib/repositories/student.repository";

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const user = await getSessionUser("STUDENT");

  const { taskId } = await params;
  const profile = await studentRepository.findProfileByUserId(user.id);
  const task = await taskRepository.findByIdWithAnswer(taskId);

  await studentRepository.recordAttempt({
    studentId: profile.id,
    taskId: task.id,
    submittedAnswer: "",
    isCorrect: false,
    hintsUsedCount: 0,
    revealedSolution: true,
    timeSpentSeconds: 0,
  });

  return NextResponse.json({ correctAnswer: task.correctAnswer });
}
