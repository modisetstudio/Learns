import type { TaskDifficulty, TaskTopic, UserRole } from "@prisma/client";

export type { TaskDifficulty, TaskTopic, UserRole };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
}

export interface TopicStat {
  topic: TaskTopic;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface StudentDashboardData {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  weeklyAttempted: number;
  weeklyCorrect: number;
  topicStats: TopicStat[];
}

export interface SolutionStep {
  order: number;
  socraticQuestion: string;
  expectedInsight: string;
}

export interface TaskWithoutAnswer {
  id: string;
  topic: TaskTopic;
  difficulty: TaskDifficulty;
  statementLatex: string;
  imageUrl: string | null;
  imageAlt: string | null;
  answerFormat: string;
  choices: string[] | null;
}

export type ChatRoleClient = "STUDENT" | "TUTOR";

export interface ChatMessageClient {
  id: string;
  role: ChatRoleClient;
  content: string;
  createdAt: string;
}
