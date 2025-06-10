import ChatHeader from "./chat-header";
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
  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <ChatHeader currentChat={currentChat} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
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