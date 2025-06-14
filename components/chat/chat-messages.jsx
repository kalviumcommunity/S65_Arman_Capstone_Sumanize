import { MessageItem } from "./message-item";
import { LoadingIndicator } from "./loading-indicator";
import { EmptyState } from "./empty-state";

export function ChatMessages({
  messages,
  isLoading,
  isNewChatPending,
  messagesEndRef,
  onSendMessage,
  onPastedContentClick,
  onCitationClick,
  isInSplitView,
}) {
  if (messages.length === 0 && !isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          isNewChatPending={isNewChatPending}
          onSendMessage={onSendMessage}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center overflow-y-auto p-4">
      <div
        className={`w-full space-y-4 ${isInSplitView ? "px-4" : "max-w-2xl"}`}
      >
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onPastedContentClick={onPastedContentClick}
            onCitationClick={onCitationClick}
          />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}
