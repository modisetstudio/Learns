import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { studentRepository } from "@/lib/repositories/student.repository";
import { testSessionRepository } from "@/lib/repositories/test-session.repository";

export async function POST(): Promise<NextResponse> {
  const user = await getSessionUser("STUDENT");

  const profile = await studentRepository.findProfileByUserId(user.id);

  try {
    const testSession = await testSessionRepository.create(profile.id);
    return NextResponse.json({ id: testSession.id });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_TASKS_AVAILABLE") {
      return NextResponse.json({ error: "V databázi zatím nejsou žádné úlohy pro test." }, { status: 409 });
    }
    return NextResponse.json({ error: "Test se nepodařilo vytvořit." }, { status: 500 });
  }
}
