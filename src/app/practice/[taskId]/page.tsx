import { getSessionUser } from "@/lib/session";
import { taskRepository } from "@/lib/repositories/task.repository";
import { studentRepository } from "@/lib/repositories/student.repository";
import { chatRepository } from "@/lib/repositories/chat.repository";
import { AnswerPanel } from "@/components/practice/answer-panel";
import { ChatPanel } from "@/components/practice/chat-panel";

interface PracticeTaskPageProps {
  params: Promise<{ taskId: string }>;
}

export default async function PracticeTaskPage({ params }: PracticeTaskPageProps): Promise<React.JSX.Element> {
  const { taskId } = await params;
  const user = await getSessionUser("STUDENT");

  const profile = await studentRepository.findProfileByUserId(user.id);
  const task = await taskRepository.findByIdWithoutAnswer(taskId);
  const chatSession = await chatRepository.getOrCreateSession(profile.id, task.id);

  return (
    <main className="grid h-[calc(100dvh-0px)] grid-cols-1 md:grid-cols-2">
      <section className="border-b border-border md:border-b-0 md:border-r">
        <AnswerPanel task={task} startedAt={Date.now()} nextTaskHref="/practice" />
      </section>
      <section className="h-[60dvh] md:h-auto">
        <ChatPanel chatSessionId={chatSession.id} initialMessages={chatSession.messages} />
      </section>
    </main>
  );
}
