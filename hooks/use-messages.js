import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useMessages(currentChatId) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (currentChatId) {
      if (session) {
        loadMessagesFromDatabase(currentChatId, signal);
      } else {
        loadMessagesFromLocalStorage(currentChatId);
      }
    }

    return () => {
      controller.abort();
    };
  }, [currentChatId, session]);

  const loadMessagesFromLocalStorage = (chatId) => {
    try {
      const storedChats = localStorage.getItem("sumanize_chats");
      const chatData = storedChats ? JSON.parse(storedChats) : {};
      const chat = chatData[chatId];
      setMessages(chat?.messages || []);
    } catch (error) {
      console.error("Error loading messages from localStorage:", error);
      setMessages([]);
    }
  };

  const loadMessagesFromDatabase = async (chatId, signal) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, { signal });
      if (!response.ok) {
        if (response.status === 401) {
          console.warn(
            "Session not ready on server during message load, will retry.",
          );
          return;
        }
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error loading messages from database:", error);
      }
      setMessages([]);
    }
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateLastMessage = (content) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === "assistant") {
        lastMessage.content = content;
      }
      return newMessages;
    });
  };

  const setErrorMessage = (errorText) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === "assistant") {
        lastMessage.content = errorText;
      }
      return newMessages;
    });
  };

  return {
    messages,
    loading,
    setLoading,
    addMessage,
    updateLastMessage,
    setErrorMessage,
    setMessages,
  };
}
