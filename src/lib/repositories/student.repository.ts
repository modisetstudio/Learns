import { prisma } from "@/lib/prisma";
import { STREAK_GRACE_HOURS } from "@/constants";
import type { StudentDashboardData, TopicStat } from "@/types";
import type { TaskTopic } from "@prisma/client";

export const studentRepository = {
  async findProfileByUserId(userId: string) {
    return prisma.studentProfile.findUniqueOrThrow({ where: { userId } });
  },

  async recordAttempt(params: {
    studentId: string;
    taskId: string;
    submittedAnswer: string;
    isCorrect: boolean;
    hintsUsedCount: number;
    revealedSolution: boolean;
    timeSpentSeconds: number;
    testSessionId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const attempt = await tx.taskAttempt.create({ data: params });

      const profile = await tx.studentProfile.findUniqueOrThrow({ where: { id: params.studentId } });
      const now = new Date();
      const hoursSinceLastActivity = profile.lastActivityAt
        ? (now.getTime() - profile.lastActivityAt.getTime()) / (1000 * 60 * 60)
        : Number.POSITIVE_INFINITY;

      const continuesStreak = hoursSinceLastActivity <= STREAK_GRACE_HOURS;
      const isNewDay = hoursSinceLastActivity >= 20; // avoid incrementing multiple times same day
      const nextStreak = continuesStreak ? (isNewDay ? profile.currentStreak + 1 : profile.currentStreak) : 1;

      await tx.studentProfile.update({
        where: { id: params.studentId },
        data: {
          lastActivityAt: now,
          currentStreak: nextStreak,
          longestStreak: Math.max(profile.longestStreak, nextStreak),
          totalXp: { increment: params.isCorrect ? 10 : 2 },
        },
      });

      return attempt;
    });
  },

  async getDashboardData(studentId: string): Promise<StudentDashboardData> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [profile, weeklyAttempts, topicRows] = await Promise.all([
      prisma.studentProfile.findUniqueOrThrow({ where: { id: studentId } }),
      prisma.taskAttempt.findMany({
        where: { studentId, createdAt: { gte: oneWeekAgo } },
        select: { isCorrect: true },
      }),
      prisma.taskAttempt.findMany({
        where: { studentId },
        select: { isCorrect: true, task: { select: { topic: true } } },
      }),
    ]);

    const topicMap = new Map<TaskTopic, { attempted: number; correct: number }>();
    for (const row of topicRows) {
      const current = topicMap.get(row.task.topic) ?? { attempted: 0, correct: 0 };
      current.attempted += 1;
      if (row.isCorrect) current.correct += 1;
      topicMap.set(row.task.topic, current);
    }

    const topicStats: TopicStat[] = Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      attempted: stats.attempted,
      correct: stats.correct,
      accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
    }));

    return {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      totalXp: profile.totalXp,
      weeklyAttempted: weeklyAttempts.length,
      weeklyCorrect: weeklyAttempts.filter((a) => a.isCorrect).length,
      topicStats,
    };
  },
};
