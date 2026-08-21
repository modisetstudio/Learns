import { prisma } from "@/lib/prisma";
import type { ChatMessageClient } from "@/types";

export const chatRepository = {
  async getOrCreateSession(studentId: string, taskId: string): Promise<{ id: string; messages: ChatMessageClient[] }> {
    const existing = await prisma.chatSession.findFirst({
      where: { studentId, taskId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (existing) {
      return {
        id: existing.id,
        messages: existing.messages
          .filter((message) => message.role !== "SYSTEM")
          .map((message) => ({
            id: message.id,
            role: message.role as "STUDENT" | "TUTOR",
            content: message.content,
            createdAt: message.createdAt.toISOString(),
          })),
      };
    }

    const created = await prisma.chatSession.create({
      data: { studentId, taskId },
    });

    return { id: created.id, messages: [] };
  },
};
