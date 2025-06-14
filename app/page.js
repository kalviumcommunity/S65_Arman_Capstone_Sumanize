"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useChatManagement } from "@/hooks/use-chat-management";
import { useMessages } from "@/hooks/use-messages";
import { useAbly } from "@/hooks/use-ably";
import { ChatSidebar } from "@/components/sidebar/chat-sidebar";
import { ChatContainer } from "@/components/chat/chat-container";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { CommandPalette } from "@/components/command/cmdk";

export default function HomePage() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

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

  const { messages, setMessages, setMessagesWithoutReload, messagesEndRef } =
    useMessages(activeChatId, isNewChatPending);

  const ably = useAbly(
    activeChatId,
    isNewChatPending,
    setMessages,
    setIsLoading,
  );

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleCommandSelect = (chatId) => {
    if (chatId === null) {
      // New chat
      prepareNewChat();
    } else {
      // Existing chat
      selectChat(chatId);
    }
  };

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
          setMessagesWithoutReload={setMessagesWithoutReload}
          messagesEndRef={messagesEndRef}
          createNewChatInBackend={createNewChatInBackend}
          generateChatTitle={generateChatTitle}
          ably={ably}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectChat={handleCommandSelect}
      />
    </div>
  );
}
