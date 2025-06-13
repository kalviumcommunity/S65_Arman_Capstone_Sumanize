import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Ably from "ably";

export function useAbly(
  activeChatId,
  isNewChatPending,
  setMessages,
  setIsLoading,
) {
  const { data: session } = useSession();
  const ablyRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const isAuthenticated = session?.user?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      cleanup();
      return;
    }

    let mounted = true;

    const initializeAbly = async () => {
      try {
        console.log("Initializing Ably connection for user:", session.user.id);

        const ably = new Ably.Realtime({
          authUrl: "/api/ably/token",
          authMethod: "POST",
          authHeaders: {
            "Content-Type": "application/json",
          },
        });

        ablyRef.current = ably;

        ably.connection.on("connected", () => {
          if (mounted) {
            console.log("Ably connected successfully");
            setIsConnected(true);
            setConnectionError(null);
          }
        });

        ably.connection.on("disconnected", () => {
          if (mounted) {
            console.log("Ably disconnected");
            setIsConnected(false);
          }
        });

        ably.connection.on("failed", (stateChange) => {
          if (mounted) {
            console.error("Ably connection failed:", stateChange.reason);
            setIsConnected(false);
            setConnectionError(
              stateChange.reason?.message || "Connection failed",
            );
          }
        });

        ably.connection.on("suspended", () => {
          if (mounted) {
            console.warn("Ably connection suspended");
            setIsConnected(false);
          }
        });
      } catch (error) {
        console.error("Ably initialization error:", error);
        if (mounted) {
          setConnectionError(error.message);
          setIsConnected(false);
        }
      }
    };

    initializeAbly();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [isAuthenticated, session?.user?.id]);

  useEffect(() => {
    if (!isConnected || !ablyRef.current || !activeChatId || isNewChatPending) {
      return;
    }

    console.log("Subscribing to channels for chat:", activeChatId);

    const ably = ablyRef.current;
    const aiChannel = ably.channels.get(
      `ai-responses:${session.user.id}:${activeChatId}`,
    );
    const statusChannel = ably.channels.get(
      `ai-status:${session.user.id}:${activeChatId}`,
    );

    const handleAiChunk = (message) => {
      const { text, timestamp } = message.data;

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];

        if (
          lastMessage &&
          lastMessage.role === "assistant" &&
          !lastMessage.completed
        ) {
          lastMessage.content += text;
          lastMessage.timestamp = new Date(timestamp);
        } else {
          newMessages.push({
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role: "assistant",
            content: text,
            timestamp: new Date(timestamp),
            completed: false,
          });
        }

        return newMessages;
      });
    };

    const handleAiComplete = (message) => {
      const { content, timestamp } = message.data;

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];

        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = content;
          lastMessage.completed = true;
          lastMessage.timestamp = new Date(timestamp);
          lastMessage.id = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        return newMessages;
      });

      setIsLoading(false);
      console.log("AI response completed");
    };

    const handleAiStarted = () => {
      console.log("AI processing started");
      setIsLoading(true);
    };

    const handleAiCompleted = () => {
      console.log("AI processing completed");
      setIsLoading(false);
    };

    const handleAiError = (message) => {
      console.error("AI processing error:", message.data.error);
      setIsLoading(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date(),
          completed: true,
        },
      ]);
    };

    aiChannel.subscribe("ai-chunk", handleAiChunk);
    aiChannel.subscribe("ai-complete", handleAiComplete);
    statusChannel.subscribe("ai-started", handleAiStarted);
    statusChannel.subscribe("ai-completed", handleAiCompleted);
    statusChannel.subscribe("ai-error", handleAiError);

    return () => {
      console.log("Cleaning up channel subscriptions for chat:", activeChatId);
      aiChannel.unsubscribe();
      statusChannel.unsubscribe();
    };
  }, [
    isConnected,
    activeChatId,
    isNewChatPending,
    session?.user?.id,
    setMessages,
    setIsLoading,
  ]);

  const cleanup = () => {
    if (ablyRef.current) {
      console.log("Closing Ably connection");
      ablyRef.current.close();
      ablyRef.current = null;
    }
    setIsConnected(false);
    setConnectionError(null);
  };

  const sendMessage = async (message, chatId) => {
    try {
      setIsLoading(true);
      console.log("Sending message to AI processing API");

      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          chatId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `AI processing failed: ${response.status} - ${errorData.error}`,
        );
      }

      const result = await response.json();
      console.log("Message sent successfully:", result);
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
      return false;
    }
  };

  return {
    isConnected,
    connectionError,
    sendMessage,
  };
}
