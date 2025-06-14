"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useChatManagement() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isNewChatPending, setIsNewChatPending] = useState(false);

  const isAuthenticated = status === "authenticated";

  const prepareNewChat = () => {
    setActiveChatId(null);
    setIsNewChatPending(true);
  };

  const createNewChatInBackend = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newChat = await res.json();
        return newChat;
      }
      return null;
    } catch (error) {
      console.error("Failed to create new chat in backend:", error);
      return null;
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/details`, {
        method: "DELETE",
      });

      if (res.ok) {
        const remainingChats = chats.filter((chat) => chat.chatId !== chatId);
        setChats(remainingChats);

        if (activeChatId === chatId) {
          prepareNewChat();
        }
      } else {
        console.error("Failed to delete chat:", res.status, res.statusText);
        alert("Failed to delete chat. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat. Please try again.");
    }
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    setIsNewChatPending(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadChats = async () => {
      try {
        const res = await fetch("/api/chats");
        const data = await res.json();
        setChats(data);

        prepareNewChat();
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };

    loadChats();
  }, [isAuthenticated]);

  const generateChatTitle = async (chatId, titleData) => {
    try {
      let messageContent, pastedContent;

      if (typeof titleData === "string") {
        messageContent = titleData;
        pastedContent = null;
      } else if (typeof titleData === "object" && titleData !== null) {
        messageContent = titleData.messageContent;
        pastedContent = titleData.pastedContent;
      } else {
        messageContent = "New Chat";
        pastedContent = null;
      }

      const titleRes = await fetch(`/api/chats/${chatId}/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          pastedContent: pastedContent,
        }),
      });

      if (titleRes.ok) {
        const { title } = await titleRes.json();
        setChats((prev) =>
          prev.map((chat) =>
            chat.chatId === chatId ? { ...chat, title } : chat,
          ),
        );
      } else {
        console.error(
          "Failed to generate title:",
          titleRes.status,
          titleRes.statusText,
        );
      }
    } catch (titleError) {
      console.error("Failed to generate title:", titleError);
    }
  };

  return {
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
  };
}
