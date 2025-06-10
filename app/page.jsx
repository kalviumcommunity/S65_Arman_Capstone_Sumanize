"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AuthModal from "@/components/auth/auth-modal";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatArea from "@/components/chat/chat-area";
import { useChats } from "@/hooks/use-chats";
import { useMessages } from "@/hooks/use-messages";
import { useMessageLimit } from "@/hooks/use-message-limit";
import { useSendMessage } from "@/hooks/use-send-message";

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

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950">
      {/* Sidebar */}
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

      {/* Main Chat Area */}
      <ChatArea
        currentChat={currentChat}
        messages={messages}
        loading={loading}
        isAuthenticated={isAuthenticated}
        isLimitReached={isLimitReached}
        onSendMessage={handleSendMessage}
        onSignIn={handleSignIn}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
