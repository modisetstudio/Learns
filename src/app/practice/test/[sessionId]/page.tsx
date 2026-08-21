import { ExamRunner } from "./exam-runner";

export const metadata = { title: "Ostrý test" };

interface ExamPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ExamPage({ params }: ExamPageProps): Promise<React.JSX.Element> {
  const { sessionId } = await params;
  return <ExamRunner sessionId={sessionId} />;
}
