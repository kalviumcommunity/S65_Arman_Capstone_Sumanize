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
          if (remainingChats.length > 0) {
            setActiveChatId(remainingChats[0].chatId);
            setIsNewChatPending(false);
          } else {
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadChats = async () => {
      try {
        const res = await fetch("/api/chats");
        const data = await res.json();
        setChats(data);

        if (data.length > 0) {
          setActiveChatId(data[0].chatId);
          setIsNewChatPending(false);
        } else {
          prepareNewChat();
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };

    loadChats();
  }, [isAuthenticated]);

  const generateChatTitle = async (chatId, messageContent) => {
    try {
      console.log(
        `Generating title for chat ${chatId} with message: "${messageContent}"`,
      );
      const titleRes = await fetch(`/api/chats/${chatId}/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageContent }),
      });

      if (titleRes.ok) {
        const { title } = await titleRes.json();
        setChats((prev) =>
          prev.map((chat) =>
            chat.chatId === chatId ? { ...chat, title } : chat,
          ),
        );
        console.log(`Chat title updated to: "${title}" for chat ${chatId}`);
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
