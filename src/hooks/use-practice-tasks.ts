import { useQuery } from "@tanstack/react-query";

import type { TaskWithoutAnswer } from "@/types";
import type { TaskDifficulty, TaskTopic } from "@prisma/client";

interface UsePracticeTasksParams {
  topic?: TaskTopic;
  difficulty?: TaskDifficulty;
}

async function fetchPracticeTasks(params: UsePracticeTasksParams): Promise<TaskWithoutAnswer[]> {
  const searchParams = new URLSearchParams();
  if (params.topic) searchParams.set("topic", params.topic);
  if (params.difficulty) searchParams.set("difficulty", params.difficulty);

  const response = await fetch(`/api/tasks?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Nepodařilo se načíst úlohy.");
  }
  return (await response.json()) as TaskWithoutAnswer[];
}

export function usePracticeTasks(params: UsePracticeTasksParams) {
  return useQuery({
    queryKey: ["practice-tasks", params],
    queryFn: () => fetchPracticeTasks(params),
  });
}
