import { LaunchChatScreen } from "@/features/launch-chat/launch-chat-screen";
import { requireAuthenticatedPage } from "@/lib/require-authenticated-page";

export default async function ChatRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  await requireAuthenticatedPage();

  const { runId } = await params;

  return <LaunchChatScreen runId={runId} />;
}
