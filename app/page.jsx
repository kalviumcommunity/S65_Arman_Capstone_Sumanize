"use client";

import React, { useState, useEffect } from "react";
import { ChatProvider } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { toast } from "sonner";
import Sidebar from "@/components/summarize/sidebar";
import Conversation from "@/components/summarize/conversation";
import { AuthModal } from "@/components/auth/auth-modal";
import AccountMenu from "@/components/summarize/account";
import { motion } from "framer-motion";

function SummarizeContent() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const { user, isLoading } = useAuth();
  const { conversations, startNewConversation } = useChat();

  useEffect(() => {
    const saved = localStorage.getItem("sumanize-sidebar-width");
    if (saved) setSidebarWidth(parseInt(saved, 10));
  }, []);

  // useEffect(() => {
  //   if (
  //     conversations.length === 0 ||
  //     !conversations.some((c) => c.messages.length === 0)
  //   ) {
  //     startNewConversation();
  //   }
  // }, [conversations, startNewConversation]);

  useEffect(() => {
    localStorage.setItem("sumanize-sidebar-width", sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const handleOpenAuthModal = (e) => {
      if (e.detail && e.detail.tab) {
        setAuthModalTab(e.detail.tab);
      }
      setIsAuthModalOpen(true);
    };

    const handleShowAuthToast = () => {
      toast.info("Sign up to save your conversations", {
        action: {
          label: "Sign Up",
          onClick: () => openAuthModal("register"),
        },
      });
    };

    document.addEventListener("open-auth-modal", handleOpenAuthModal);
    document.addEventListener("show-auth-toast", handleShowAuthToast);

    return () => {
      document.removeEventListener("open-auth-modal", handleOpenAuthModal);
      document.removeEventListener("show-auth-toast", handleShowAuthToast);
    };
  }, []);

  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const fadeIn = {
    hidden: {
      opacity: 0,
      filter: "blur(40px)",
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  // if (isLoading) {
  //   return (
  //     <motion.div
  //       className="bg-neutral-900 min-h-screen flex items-center justify-center"
  //       initial="hidden"
  //       animate="visible"
  //       variants={fadeIn}
  //     >
  //       <Spinner
  //         className="animate-spin text-neutral-300"
  //         size={40}
  //       />
  //     </motion.div>
  //   );
  // }

  return (
    <>
      <motion.div
        className={`bg-neutral-900 min-h-screen flex h-screen relative ${isAuthModalOpen ? "blur-md" : ""}`}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {user && (
          <div className="absolute top-6 right-8 z-30">
            <AccountMenu user={user} />
          </div>
        )}

        <Sidebar
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          sidebarWidth={sidebarWidth}
          setSidebarWidth={setSidebarWidth}
          user={user}
        />
        <Conversation
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          sidebarWidth={sidebarWidth}
        />
      </motion.div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}

export default function SummarizePage() {
  return (
    <ChatProvider>
      <SummarizeContent />
    </ChatProvider>
  );
}
