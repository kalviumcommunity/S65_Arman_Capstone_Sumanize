import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useChatManagement() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isNewChatPending, setIsNewChatPending] = useState(false);

  const isAuthenticated = status === "authenticated";

  // Prepare for new chat (without creating in database)
  const prepareNewChat = () => {
    setActiveChatId(null);
    setIsNewChatPending(true);
  };

  // Create new chat function (only called when sending first message)
  const createNewChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const newChat = await res.json();
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.chatId);
        setIsNewChatPending(false);
        return newChat.chatId;
      }
    } catch (error) {
      console.error("Failed to create new chat:", error);
      return null;
    }
  };

  // Delete chat function
  const deleteChat = async (chatId) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/details`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Get remaining chats before updating state
        const remainingChats = chats.filter((chat) => chat.chatId !== chatId);

        // Remove chat from state
        setChats(remainingChats);

        // If deleted chat was active, select another chat or prepare for new one
        if (activeChatId === chatId) {
          if (remainingChats.length > 0) {
            setActiveChatId(remainingChats[0].chatId);
            setIsNewChatPending(false);
          } else {
            // No chats left, prepare for new one
            prepareNewChat();
          }
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

  // Load user's chats when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadChats = async () => {
      try {
        const res = await fetch("/api/chats");
        const data = await res.json();
        setChats(data);

        // If user has chats, select the most recent one
        if (data.length > 0) {
          setActiveChatId(data[0].chatId);
          setIsNewChatPending(false);
        } else {
          // Prepare for first chat for new users
          prepareNewChat();
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };

    loadChats();
  }, [isAuthenticated]);

  // Generate title for new chats
  const generateChatTitle = async (chatId, messageContent) => {
    try {
      console.log(
        `🎯 Generating title for chat ${chatId} with message: "${messageContent}"`,
      );
      const titleRes = await fetch(`/api/chats/${chatId}/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageContent }),
      });

      if (titleRes.ok) {
        const { title } = await titleRes.json();
        // Update the chat title in local state
        setChats((prev) =>
          prev.map((chat) =>
            chat.chatId === chatId ? { ...chat, title } : chat,
          ),
        );
        console.log(`✅ Chat title updated to: "${title}" for chat ${chatId}`);
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
    createNewChat,
    deleteChat,
    selectChat,
    generateChatTitle,
  };
}
