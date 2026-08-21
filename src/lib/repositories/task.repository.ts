import type { Prisma, TaskDifficulty, TaskTopic } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { TaskWithoutAnswer } from "@/types";

export interface TaskListFilters {
  topic?: TaskTopic;
  difficulty?: TaskDifficulty;
  excludeSolvedByStudentId?: string;
}

/**
 * Centralizes all Task-related persistence so route handlers and server
 * actions never call `prisma.task.*` directly. Keeps answer-bearing fields
 * out of any client-facing payload by construction.
 */
export const taskRepository = {
  async findManyForPractice(filters: TaskListFilters, take = 20): Promise<TaskWithoutAnswer[]> {
    const where: Prisma.TaskWhereInput = {
      isPublished: true,
      ...(filters.topic ? { topic: filters.topic } : {}),
      ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
      ...(filters.excludeSolvedByStudentId
        ? {
            attempts: {
              none: { studentId: filters.excludeSolvedByStudentId, isCorrect: true },
            },
          }
        : {}),
    };

    const tasks = await prisma.task.findMany({
      where,
      take,
      orderBy: [{ year: "desc" }, { orderInTest: "asc" }],
      select: {
        id: true,
        topic: true,
        difficulty: true,
        statementLatex: true,
        imageUrl: true,
        imageAlt: true,
        answerFormat: true,
        choices: true,
      },
    });

    return tasks.map((task) => ({
      ...task,
      choices: (task.choices as string[] | null) ?? null,
    }));
  },

  async findByIdWithAnswer(taskId: string) {
    return prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  },

  async findByIdWithoutAnswer(taskId: string): Promise<TaskWithoutAnswer> {
    const task = await prisma.task.findUniqueOrThrow({
      where: { id: taskId },
      select: {
        id: true,
        topic: true,
        difficulty: true,
        statementLatex: true,
        imageUrl: true,
        imageAlt: true,
        answerFormat: true,
        choices: true,
      },
    });
    return { ...task, choices: (task.choices as string[] | null) ?? null };
  },

  async create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({ data });
  },

  async update(taskId: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id: taskId }, data });
  },

  async delete(taskId: string) {
    return prisma.task.delete({ where: { id: taskId } });
  },

  async countByTopic(): Promise<Array<{ topic: TaskTopic; count: number }>> {
    const grouped = await prisma.task.groupBy({
      by: ["topic"],
      where: { isPublished: true },
      _count: { _all: true },
    });
    return grouped.map((row) => ({ topic: row.topic, count: row._count._all }));
  },
};
