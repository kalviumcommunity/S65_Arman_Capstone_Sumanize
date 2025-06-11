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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="flex h-screen bg-neutral-900 text-white">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 bg-neutral-900 transition-all duration-300 ease-in-out overflow-hidden ${
          isSidebarCollapsed ? "w-0" : "w-64 border-r border-neutral-800"
        }`}
      >
        <div className="w-64 h-full">
          <ChatSidebar
            chats={chats}
            activeChatId={activeChatId}
            onCreateChat={prepareNewChat}
            onSelectChat={selectChat}
            onDeleteChat={deleteChat}
            isNewChatPending={isNewChatPending}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex min-w-0 relative">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 z-10 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full p-1"
          style={{ left: "-12px" }}
          title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          {isSidebarCollapsed ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          )}
        </button>
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
