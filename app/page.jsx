"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useChatManagement } from "@/hooks/use-chat-management";
import { useMessages } from "@/hooks/use-messages";
import { useAbly } from "@/hooks/use-ably";
import { ChatSidebar } from "@/components/sidebar/chat-sidebar";
import { ChatContainer } from "@/components/chat/chat-container";
import { LoadingScreen } from "@/components/auth/loading-screen";

export default function HomePage() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    isNewChatPending,
    setIsNewChatPending,
    isAuthenticated,
    prepareNewChat,
    createNewChatInBackend,
    deleteChat,
    selectChat,
    generateChatTitle,
  } = useChatManagement();

  const { messages, setMessages, messagesEndRef } = useMessages(
    activeChatId,
    isNewChatPending,
  );

  const ably = useAbly(
    activeChatId,
    isNewChatPending,
    setMessages,
    setIsLoading,
  );

  if (status === "loading") {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onCreateChat={prepareNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        isNewChatPending={isNewChatPending}
      />

      <div className="flex-1 flex min-w-0">
        <ChatContainer
          chats={chats}
          setChats={setChats}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          isNewChatPending={isNewChatPending}
          setIsNewChatPending={setIsNewChatPending}
          messages={messages}
          setMessages={setMessages}
          messagesEndRef={messagesEndRef}
          createNewChatInBackend={createNewChatInBackend}
          generateChatTitle={generateChatTitle}
          ably={ably}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
