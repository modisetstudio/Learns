import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { taskRepository } from "@/lib/repositories/task.repository";

interface RouteParams {
  params: Promise<{ taskId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  await getSessionUser("STUDENT");
  const { taskId } = await params;
  const hints = await taskRepository.findHintsById(taskId);
  return NextResponse.json({ hints });
}
