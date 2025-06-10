"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/auth-modal";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatArea from "@/components/chat/chat-area";
// Make sure to import your new loading screen
import LoadingScreen from "@/components/background/loading-screen";
import { useChats } from "@/hooks/use-chats";
import { useMessages } from "@/hooks/use-messages";
import { useMessageLimit } from "@/hooks/use-message-limit";
import { useSendMessage } from "@/hooks/use-send-message";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function HomePage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // Loading state - UPDATED
  if (status === "loading") {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-neutral-950 text-white">
      <PanelGroup
        direction="horizontal"
        autoSaveId="sidebar-layout"
        className="h-full"
      >
        <Panel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className="min-w-[260px] max-w-[500px]"
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
        </Panel>
        <PanelResizeHandle className="w-[4px] bg-neutral-800/50 transition-colors hover:bg-blue-600 active:bg-blue-700" />
        <Panel>
          <ChatArea
            currentChat={currentChat}
            messages={messages}
            loading={loading}
            isAuthenticated={isAuthenticated}
            isLimitReached={isLimitReached}
            onSendMessage={handleSendMessage}
            onSignIn={handleSignIn}
          />
        </Panel>
      </PanelGroup>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
