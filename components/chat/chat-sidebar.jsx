import { Button } from "@/components/ui/button";
import ChatList from "./chat-list";
import UserProfile from "./user-profile";
import MessageCountDisplay from "./message-count-display";

export default function ChatSidebar({
  session,
  chats,
  currentChatId,
  messageCount,
  limit,
  isLimitReached,
  isAuthenticated,
  onNewChat,
  onChatSelect,
  onChatDelete,
  onSignIn,
}) {
  return (
    <div className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Sumanize</h1>
          {!isAuthenticated && (
            <Button
              onClick={onSignIn}
              variant="outline"
              size="sm"
              className="bg-transparent border-neutral-700 text-white hover:bg-neutral-800"
            >
              Sign In
            </Button>
          )}
        </div>
        <Button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          + New Chat
        </Button>
      </div>

      {/* Message Count Display */}
      <MessageCountDisplay
        messageCount={messageCount}
        limit={limit}
        isLimitReached={isLimitReached}
        isAuthenticated={isAuthenticated}
      />

      {/* Chat List */}
      <ChatList
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={onChatSelect}
        onChatDelete={onChatDelete}
      />

      {/* User Section */}
      <div className="p-4 border-t border-neutral-800">
        <UserProfile session={session} onSignIn={onSignIn} />
      </div>
    </div>
  );
}
