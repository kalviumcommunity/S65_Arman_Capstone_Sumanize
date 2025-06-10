import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useChats() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (status === "authenticated") {
      loadChatsFromDatabase(signal);
    } else if (status === "unauthenticated") {
      loadChatsFromLocalStorage();
    }

    return () => {
      controller.abort();
    };
  }, [status]);

  const loadChatsFromDatabase = async (signal) => {
    try {
      const response = await fetch("/api/chats", { signal });
      if (!response.ok) {
        if (response.status === 401) {
          console.warn(
            "Session not ready on server during chat load, will retry.",
          );
          return;
        }
        throw new Error(`Failed to fetch chats: ${response.statusText}`);
      }

      const data = await response.json();
      const dbChats = data.chats || [];
      setChats(dbChats);

      if (dbChats.length > 0) {
        setCurrentChatId((prevId) =>
          dbChats.some((c) => c.id === prevId) ? prevId : dbChats[0].id,
        );
      } else {
        createNewChat();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error loading chats from database:", error);
      }
    }
  };

  const loadChatsFromLocalStorage = () => {
    try {
      const storedChats = localStorage.getItem("sumanize_chats");
      const chatData = storedChats ? JSON.parse(storedChats) : {};
      const chatArray = Object.values(chatData).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
      setChats(chatArray);

      if (chatArray.length > 0) {
        setCurrentChatId(chatArray[0].id);
      } else {
        createNewChat();
      }
    } catch (error) {
      console.error("Error loading chats from localStorage:", error);
      createNewChat();
    }
  };

  const saveChatsToLocalStorage = (updatedChats) => {
    try {
      const chatObject = {};
      updatedChats.forEach((chat) => {
        chatObject[chat.id] = chat;
      });
      localStorage.setItem("sumanize_chats", JSON.stringify(chatObject));
    } catch (error) {
      console.error("Error saving chats to localStorage:", error);
    }
  };

  const createNewChat = async () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (session) {
      try {
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Chat" }),
        });

        if (response.ok) {
          const data = await response.json();
          const dbChat = data.chat;
          setChats((prev) => [dbChat, ...prev]);
          setCurrentChatId(dbChat.id);
        }
      } catch (error) {
        console.error("Error creating chat in database:", error);
      }
    } else {
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      setCurrentChatId(newChat.id);
      saveChatsToLocalStorage(updatedChats);
    }
  };

  const deleteChat = async (chatId) => {
    if (session) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setChats((prev) => prev.filter((chat) => chat.id !== chatId));

          if (currentChatId === chatId) {
            const remainingChats = chats.filter((chat) => chat.id !== chatId);
            if (remainingChats.length > 0) {
              setCurrentChatId(remainingChats[0].id);
            } else {
              createNewChat();
            }
          }
        }
      } catch (error) {
        console.error("Error deleting chat from database:", error);
      }
    } else {
      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);

      if (currentChatId === chatId) {
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id);
        } else {
          createNewChat();
        }
      }

      saveChatsToLocalStorage(updatedChats);
    }
  };

  const updateChatWithMessages = (chatId, newMessages) => {
    if (!session) {
      const updatedChats = chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: newMessages,
              updatedAt: new Date().toISOString(),
            }
          : chat,
      );
      setChats(updatedChats);
      saveChatsToLocalStorage(updatedChats);
    }
  };

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return {
    chats,
    currentChatId,
    currentChat,
    setCurrentChatId,
    createNewChat,
    deleteChat,
    updateChatWithMessages,
  };
}
