"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
// Hooks
import { useChatManagement } from "@/hooks/use-chat-management";
import { useMessages } from "@/hooks/use-messages";
import { useWebSocket } from "@/hooks/use-websocket";
// Components
import { ChatSidebar } from "@/components/sidebar/chat-sidebar";
import { ChatContainer } from "@/components/chat/chat-container";
import { SignInPrompt } from "@/components/auth/sign-in-prompt";
import { LoadingScreen } from "@/components/auth/loading-screen";

export default function HomePage() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Custom hooks
  const {
    chats,
    activeChatId,
    isNewChatPending,
    isAuthenticated,
    prepareNewChat,
    createNewChat,
    deleteChat,
    selectChat,
    generateChatTitle,
  } = useChatManagement();

  const { messages, setMessages, messagesEndRef } = useMessages(
    activeChatId,
    isNewChatPending,
  );

  const { ws } = useWebSocket(
    activeChatId,
    isNewChatPending,
    setMessages,
    setIsLoading,
  );

  // Loading state
  if (status === "loading") {
    return <LoadingScreen />;
  }

  // Main application
  return (
    <div className="flex h-screen">
      {/* Sidebar - now handles its own collapse logic */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onCreateChat={prepareNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        isNewChatPending={isNewChatPending}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex min-w-0">
        <ChatContainer
          chats={chats}
          activeChatId={activeChatId}
          isNewChatPending={isNewChatPending}
          messages={messages}
          setMessages={setMessages}
          messagesEndRef={messagesEndRef}
          createNewChat={createNewChat}
          generateChatTitle={generateChatTitle}
          ws={ws}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
