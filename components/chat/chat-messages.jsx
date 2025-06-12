import { MessageItem } from "./message-item";
import { LoadingIndicator } from "./loading-indicator";
import { EmptyState } from "./empty-state";

export function ChatMessages({
  messages,
  isLoading,
  isNewChatPending,
  messagesEndRef,
}) {
  if (messages.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <EmptyState isNewChatPending={isNewChatPending} />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center overflow-y-auto p-4">
      <div className="w-full max-w-3xl space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}
