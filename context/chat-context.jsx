"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const isFirstSave = useRef(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        let loadedConversations = [];
        let savedCurrentId = localStorage.getItem(
          "sumanize-current-conversation",
        );

        if (user) {
          const response = await fetch("/api/message");
          if (response.ok) {
            const raw = await response.json();
            loadedConversations = raw.map((chat) => ({
              ...chat,
              id: chat._id,
            }));
            setConversations(loadedConversations);
          }
        } else {
          const savedConversations = localStorage.getItem(
            "sumanize-conversation",
          );
          if (savedConversations) {
            loadedConversations = JSON.parse(savedConversations);
            setConversations(loadedConversations);
          }
        }

        if (
          savedCurrentId &&
          loadedConversations.some((c) => c.id === savedCurrentId)
        ) {
          setCurrentConversationId(savedCurrentId);
          const currentConvo = loadedConversations.find(
            (c) => c.id === savedCurrentId,
          );
          if (currentConvo) {
            setActiveMessages(currentConvo.messages);
          }
        } else {
          const emptyConversation = loadedConversations.find(
            (c) => c.messages.length === 0,
          );

          if (emptyConversation) {
            setCurrentConversationId(emptyConversation.id);
            setActiveMessages([]);
          } else {
            await startNewConversation();
          }
        }

        const savedTab = localStorage.getItem("sumanize-active-tab");
        if (savedTab) {
          setActiveTab(savedTab);
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
        await startNewConversation();
      }
    };

    loadConversations();
  }, [user]);

  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    try {
      if (!user) {
        localStorage.setItem(
          "sumanize-conversation",
          JSON.stringify(conversations),
        );
      }

      if (currentConversationId) {
        localStorage.setItem(
          "sumanize-current-conversation",
          currentConversationId,
        );
      }
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  }, [conversations, currentConversationId, user]);

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
      localStorage.setItem("sumanize-active-tab", activeTab);
    } catch (error) {
      console.error("Failed to save active tab to localStorage:", error);
    }
  }, [activeTab]);

  const startNewConversation = async () => {
    const emptyConversation = conversations.find(
      (c) => c.messages.length === 0,
    );

    if (emptyConversation) {
      setCurrentConversationId(emptyConversation.id);
      setActiveMessages([]);
      return emptyConversation.id;
    }

    const newId = uuidv4();
    const newConversation = {
      id: newId,
      title: "Start Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        const response = await fetch("/api/message", {
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
          return newChat.id;
        }
      } catch (error) {
        console.error("Failed to create new conversation:", error);
      }
    } else {
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newId);
      setActiveMessages([]);
      return newId;
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
          "Start Conversation",
        updatedAt: new Date().toISOString(),
      };

      if (user) {
        try {
          await fetch(`/api/message/${currentConversationId}`, {
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
          await fetch(`/api/message/${conversationId}`, {
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
      const emptyConversation = remaining.find((c) => c.messages.length === 0);

      if (emptyConversation) {
        setCurrentConversationId(emptyConversation.id);
        setActiveMessages([]);
      } else if (remaining.length > 0) {
        startNewConversation();
      } else {
        startNewConversation();
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
