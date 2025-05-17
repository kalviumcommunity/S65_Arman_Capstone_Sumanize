"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./auth-context";

const ChatContext = createContext({
  conversations: [],
  currentConversationId: null,
  activeMessages: [],
  setActiveMessages: () => {},
  startNewConversation: () => {},
  selectConversation: () => {},
  activeTab: "text",
  setActiveTab: () => {},
  isLoading: false,
  submitQuery: async () => {},
});

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("text");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        if (user) {
          const response = await fetch("/api/chats");
          if (response.ok) {
            const raw = await response.json();
            const chats = raw.map((chat) => ({ ...chat, id: chat._id }));
            setConversations(chats);

            if (chats.length > 0) {
              const mostRecent = chats.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
              )[0];
              setCurrentConversationId(mostRecent.id);
              setActiveMessages(mostRecent.messages);
            }
          }
        } else {
          const savedConversations = localStorage.getItem(
            "sumanize_conversations",
          );
          if (savedConversations) {
            const parsedConversations = JSON.parse(savedConversations);
            setConversations(parsedConversations);

            if (parsedConversations.length > 0) {
              const mostRecent = parsedConversations.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
              )[0];
              setCurrentConversationId(mostRecent.id);
              setActiveMessages(mostRecent.messages);
            }
          }
        }

        const savedTab = localStorage.getItem("sumanize_active_tab");
        if (savedTab) {
          setActiveTab(savedTab);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };

    loadConversations();
  }, [user]);

  useEffect(() => {
    try {
      if (!user) {
        localStorage.setItem(
          "sumanize_conversations",
          JSON.stringify(conversations),
        );
      }
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  }, [conversations, user]);

  useEffect(() => {
    if (currentConversationId) {
      const currentConversation = conversations.find(
        (c) => c.id === currentConversationId,
      );
      if (currentConversation) {
        setActiveMessages(currentConversation.messages);
      }
    }
  }, [currentConversationId, conversations]);

  useEffect(() => {
    try {
      localStorage.setItem("sumanize_active_tab", activeTab);
    } catch (error) {
      console.error("Failed to save active tab to localStorage:", error);
    }
  }, [activeTab]);

  const startNewConversation = async () => {
    const newId = uuidv4();
    const newConversation = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newConversation),
        });

        if (response.ok) {
          const data = await response.json();
          const newChat = { ...data, id: data._id };
          setConversations((prev) => [newChat, ...prev]);
          setCurrentConversationId(newChat.id);
          setActiveMessages([]);
        }
      } catch (error) {
        console.error("Failed to create new conversation:", error);
      }
    } else {
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newId);
      setActiveMessages([]);
    }
  };

  const selectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setActiveMessages(conversation.messages);
    }
  };

  const submitQuery = async (endpoint, data, type = "text") => {
    try {
      setIsLoading(true);

      const userMessage = {
        type: "user",
        data,
        timestamp: new Date().toISOString(),
      };

      if (!currentConversationId) {
        await startNewConversation();
      }

      const updatedMessages = [...activeMessages, userMessage];
      setActiveMessages(updatedMessages);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      const aiMessage = {
        type: "ai",
        data: responseData,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setActiveMessages(finalMessages);

      let conversationTitle = null;
      if (finalMessages.length === 2) {
        try {
          const titleResponse = await fetch("/api/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: data.text }),
          });
          if (titleResponse.ok) {
            const { title } = await titleResponse.json();
            conversationTitle = title;
          } else {
            conversationTitle = data.text?.substring(0, 30) + "...";
          }
        } catch (error) {
          console.error("Failed to generate conversation title:", error);
          conversationTitle = data.text?.substring(0, 20) + "...";
        }
      }

      const updatedConversation = {
        id: currentConversationId,
        messages: finalMessages,
        title:
          conversationTitle ||
          conversations.find((c) => c.id === currentConversationId)?.title ||
          "New Chat",
        updatedAt: new Date().toISOString(),
      };

      if (user) {
        try {
          await fetch(`/api/chats/${currentConversationId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedConversation),
          });
        } catch (error) {
          console.error("Failed to update conversation:", error);
        }
      }

      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: finalMessages,
              title: conversationTitle || conv.title,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        });
      });

      return responseData;
    } catch (error) {
      const errorMessage = {
        type: "error",
        data: { message: error.message },
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...activeMessages, errorMessage];
      setActiveMessages(finalMessages);

      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: finalMessages,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        });
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      for (const message of conversation.messages) {
        if (
          message.type === "ai" &&
          message.data &&
          (message.data._id || message.data.id)
        ) {
          const id = message.data._id || message.data.id;
          try {
            await fetch(`/api/summarize/${id}`, { method: "DELETE" });
          } catch (error) {
            console.error(`Failed to delete summary ${id}:`, error);
          }
        }
      }

      if (user) {
        try {
          await fetch(`/api/chats/${conversationId}`, {
            method: "DELETE",
          });
        } catch (error) {
          console.error("Failed to delete conversation:", error);
        }
      }
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));

    if (conversationId === currentConversationId) {
      const remaining = conversations.filter((c) => c.id !== conversationId);
      if (remaining.length > 0) {
        setCurrentConversationId(remaining[0].id);
        setActiveMessages(remaining[0].messages);
      } else {
        setCurrentConversationId(null);
        setActiveMessages([]);
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        activeMessages,
        setActiveMessages,
        startNewConversation,
        selectConversation,
        deleteConversation,
        activeTab,
        setActiveTab,
        isLoading,
        submitQuery,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
