import MessageList from "./message-list";
import ChatInput from "./chat-input";

export default function ChatArea({
  currentChat,
  messages,
  loading,
  isAuthenticated,
  isLimitReached,
  onSendMessage,
  onSignIn,
}) {
  if (!currentChat) return null;

  return (
    <div className="flex flex-1 flex-col h-full bg-neutral-950">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-20">
        <MessageList
          messages={messages}
          loading={loading}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        loading={loading}
        isLimitReached={isLimitReached}
        isAuthenticated={isAuthenticated}
        onSignIn={onSignIn}
      />
    </div>
  );
}
