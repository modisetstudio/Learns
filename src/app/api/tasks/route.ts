import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/session";
import { taskRepository } from "@/lib/repositories/task.repository";
import { taskFilterSchema } from "@/lib/validations/task";
import { studentRepository } from "@/lib/repositories/student.repository";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getSessionUser("STUDENT");

  const url = new URL(request.url);
  const parsed = taskFilterSchema.safeParse({
    topic: url.searchParams.get("topic") ?? undefined,
    difficulty: url.searchParams.get("difficulty") ?? undefined,
    onlyUnsolved: url.searchParams.get("onlyUnsolved") === "true",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatné parametry filtru" }, { status: 400 });
  }

  const profile = await studentRepository.findProfileByUserId(user.id);

  const tasks = await taskRepository.findManyForPractice({
    topic: parsed.data.topic,
    difficulty: parsed.data.difficulty,
    excludeSolvedByStudentId: parsed.data.onlyUnsolved ? profile.id : undefined,
  });

  return NextResponse.json(tasks);
}
