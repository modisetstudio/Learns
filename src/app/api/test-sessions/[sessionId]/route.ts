import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { studentRepository } from "@/lib/repositories/student.repository";
import { testSessionRepository } from "@/lib/repositories/test-session.repository";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const user = await getSessionUser("STUDENT");

  const { sessionId } = await params;
  const profile = await studentRepository.findProfileByUserId(user.id);
  const testSession = await testSessionRepository.findByIdForStudent(sessionId, profile.id);

  return NextResponse.json({
    id: testSession.id,
    status: testSession.status,
    timeLimitSeconds: testSession.timeLimitSeconds,
    startedAt: testSession.startedAt,
    tasks: testSession.tasks.map((entry) => ({
      orderIndex: entry.orderIndex,
      task: {
        ...entry.task,
        choices: (entry.task.choices as string[] | null) ?? null,
      },
    })),
  });
}
