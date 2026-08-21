"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/session";
import { taskRepository } from "@/lib/repositories/task.repository";
import { adminTaskSchema, type AdminTaskInput } from "@/lib/validations/task";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

export async function createTaskAction(input: AdminTaskInput): Promise<AdminActionResult> {
  await getSessionUser("ADMIN");
  const parsed = adminTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Zkontrolujte prosím zadané údaje." };
  }

  const { choices, imageUrl, sourceUrl, ...rest } = parsed.data;

  await taskRepository.create({
    ...rest,
    imageUrl: imageUrl || null,
    sourceUrl: sourceUrl || null,
    choices: choices && choices.length > 0 ? choices : undefined,
    solutionSteps: [],
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function togglePublishAction(taskId: string, isPublished: boolean): Promise<AdminActionResult> {
  await getSessionUser("ADMIN");
  await taskRepository.update(taskId, { isPublished });
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteTaskAction(taskId: string): Promise<AdminActionResult> {
  await getSessionUser("ADMIN");
  await taskRepository.delete(taskId);
  revalidatePath("/admin");
  return { success: true };
}
