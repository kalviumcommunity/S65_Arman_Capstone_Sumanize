import { useState, useEffect, useRef } from "react";

export function useMessages(activeChatId, isNewChatPending) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const skipNextLoad = useRef(false);

  useEffect(() => {
    if (isNewChatPending || !activeChatId) {
      setMessages([]);
      return;
    }

    // Skip loading if we're told to (usually because chat-container just updated messages)
    if (skipNextLoad.current) {
      console.log(
        "Skipping message load for chat:",
        activeChatId,
        "due to skipNextLoad flag",
      );
      skipNextLoad.current = false;
      return;
    }

    const loadMessages = async () => {
      try {
        console.log("Loading messages for chat:", activeChatId);
        const res = await fetch(`/api/chats/${activeChatId}/details`);
        const chat = await res.json();
        setMessages(chat.messages || []);
        console.log(
          "Loaded",
          chat.messages?.length || 0,
          "messages for chat:",
          activeChatId,
        );
      } catch (error) {
        console.error("Failed to load messages:", error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [activeChatId, isNewChatPending]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Method to update messages without triggering a reload on next activeChatId change
  const setMessagesWithoutReload = (newMessages) => {
    console.log(
      "Setting messages without reload:",
      newMessages.length,
      "messages",
    );
    skipNextLoad.current = true;
    setMessages(newMessages);
  };

  return {
    messages,
    setMessages,
    setMessagesWithoutReload,
    messagesEndRef,
  };
}
