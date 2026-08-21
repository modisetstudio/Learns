import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/session";
import { studentRepository } from "@/lib/repositories/student.repository";
import { testSessionRepository } from "@/lib/repositories/test-session.repository";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

const completeSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const user = await getSessionUser("STUDENT");

  const { sessionId } = await params;
  const body: unknown = await request.json();
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
  }

  const profile = await studentRepository.findProfileByUserId(user.id);
  const completed = await testSessionRepository.complete(sessionId, profile.id, parsed.data.answers);

  return NextResponse.json({
    scoreCorrect: completed.scoreCorrect,
    scoreTotal: completed.scoreTotal,
  });
}
