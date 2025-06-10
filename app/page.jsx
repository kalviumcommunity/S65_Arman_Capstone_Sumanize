"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/auth-modal";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatArea from "@/components/chat/chat-area";
import LoadingScreen from "@/components/background/loading-screen";
import { useChats } from "@/hooks/use-chats";
import { useMessages } from "@/hooks/use-messages";
import { useMessageLimit } from "@/hooks/use-message-limit";
import { useSendMessage } from "@/hooks/use-send-message";
import {
  SidebarSimple,
  ArrowLineRight,
  ArrowLineLeft,
} from "@phosphor-icons/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Custom hooks
  const {
    chats,
    currentChatId,
    currentChat,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    updateChatWithMessages,
    refreshChats,
  } = useChats();

  const {
    messages,
    loading,
    setLoading,
    addMessage,
    updateLastMessage,
    setErrorMessage,
  } = useMessages(currentChatId);

  const {
    messageCount,
    limit,
    isLimitReached,
    isAuthenticated,
    incrementMessageCount,
  } = useMessageLimit();

  const { sendMessage } = useSendMessage({
    currentChatId,
    messages,
    addMessage,
    updateLastMessage,
    setErrorMessage,
    setLoading,
    incrementMessageCount,
    updateChatWithMessages,
    refreshChats,
  });

  // Auth modal handling
  useEffect(() => {
    if (searchParams.get("auth") === "required" && !session) {
      setIsAuthModalOpen(true);
    }
  }, [searchParams, session]);

  const handleSignIn = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    window.location.reload();
  };

  const handleSendMessage = async (messageText) => {
    if (isLimitReached) {
      setIsAuthModalOpen(true);
      return;
    }
    await sendMessage(messageText);
  };

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  // Loading state - UPDATED
  if (status === "loading") {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 ${
          isSidebarCollapsed ? "w-0" : "w-78"
        } overflow-y-auto`}
      >
        <ChatSidebar
          session={session}
          chats={chats}
          currentChatId={currentChatId}
          messageCount={messageCount}
          limit={limit}
          isLimitReached={isLimitReached}
          isAuthenticated={isAuthenticated}
          onNewChat={createNewChat}
          onChatSelect={setCurrentChatId}
          onChatDelete={deleteChat}
          onSignIn={handleSignIn}
        />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-20 p-2 bg-neutral-900 rounded-md cursor-pointer transition-all duration-200 group ${
            isSidebarCollapsed ? "left-4" : "left-82"
          }`}
          title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          {isSidebarCollapsed ? (
            <>
              <SidebarSimple
                size={18}
                className="text-neutral-200 group-hover:hidden"
              />
              <ArrowLineRight
                size={18}
                className="text-neutral-200 hidden group-hover:block"
              />
            </>
          ) : (
            <>
              <SidebarSimple
                size={18}
                className="text-neutral-200 group-hover:hidden"
              />
              <ArrowLineLeft
                size={18}
                className="text-neutral-200 hidden group-hover:block"
              />
            </>
          )}
        </button>
        <ChatArea
          currentChat={currentChat}
          messages={messages}
          loading={loading}
          isAuthenticated={isAuthenticated}
          isLimitReached={isLimitReached}
          onSendMessage={handleSendMessage}
          onSignIn={handleSignIn}
        />
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
