import { prisma } from "@/lib/prisma";

export const adminRepository = {
  async listTasks(take = 50) {
    return prisma.task.findMany({
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        externalCode: true,
        year: true,
        term: true,
        topic: true,
        difficulty: true,
        isPublished: true,
        statementLatex: true,
      },
    });
  },

  async getStats() {
    const [totalTasks, totalStudents, totalAttempts, totalTokensToday] = await Promise.all([
      prisma.task.count(),
      prisma.studentProfile.count(),
      prisma.taskAttempt.count(),
      prisma.chatMessage.aggregate({
        _sum: { tokensUsed: true },
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

    return {
      totalTasks,
      totalStudents,
      totalAttempts,
      tokensUsedToday: totalTokensToday._sum.tokensUsed ?? 0,
    };
  },
};
