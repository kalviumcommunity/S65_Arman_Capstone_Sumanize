"use client";

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

    if (skipNextLoad.current) {
      skipNextLoad.current = false;
      return;
    }

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${activeChatId}/details`);
        const chat = await res.json();
        setMessages(chat.messages || []);
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

  const setMessagesWithoutReload = (newMessages) => {
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