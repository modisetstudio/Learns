import { prisma } from "@/lib/prisma";
import { EXAM_TIME_LIMIT_SECONDS } from "@/constants";

const TASKS_PER_TEST = 15;

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export const testSessionRepository = {
  async create(studentId: string) {
    const candidateTasks = await prisma.task.findMany({
      where: { isPublished: true },
      select: { id: true },
    });

    if (candidateTasks.length === 0) {
      throw new Error("NO_TASKS_AVAILABLE");
    }

    const shuffled = [...candidateTasks].sort(() => Math.random() - 0.5).slice(0, TASKS_PER_TEST);

    return prisma.testSession.create({
      data: {
        studentId,
        timeLimitSeconds: EXAM_TIME_LIMIT_SECONDS,
        tasks: {
          create: shuffled.map((task, index) => ({ taskId: task.id, orderIndex: index })),
        },
      },
      include: {
        tasks: {
          orderBy: { orderIndex: "asc" },
          include: {
            task: {
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
            },
          },
        },
      },
    });
  },

  async findByIdForStudent(sessionId: string, studentId: string) {
    return prisma.testSession.findFirstOrThrow({
      where: { id: sessionId, studentId },
      include: {
        tasks: {
          orderBy: { orderIndex: "asc" },
          include: {
            task: {
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
            },
          },
        },
      },
    });
  },

  async complete(sessionId: string, studentId: string, answers: Record<string, string>) {
    const session = await prisma.testSession.findFirstOrThrow({
      where: { id: sessionId, studentId },
      include: { tasks: { include: { task: true } } },
    });

    if (session.status === "COMPLETED") {
      return session;
    }

    let scoreCorrect = 0;
    const elapsedSeconds = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
    const perTaskSeconds = Math.max(1, Math.round(elapsedSeconds / session.tasks.length));

    await prisma.$transaction(
      session.tasks.map(({ task }) => {
        const submitted = answers[task.id] ?? "";
        const isCorrect = normalizeAnswer(submitted) === normalizeAnswer(task.correctAnswer);
        if (isCorrect) scoreCorrect += 1;
        return prisma.taskAttempt.create({
          data: {
            studentId,
            taskId: task.id,
            testSessionId: sessionId,
            submittedAnswer: submitted,
            isCorrect,
            timeSpentSeconds: perTaskSeconds,
          },
        });
      }),
    );

    return prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        scoreCorrect,
        scoreTotal: session.tasks.length,
      },
    });
  },
};
