"use client";

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
            setIsConnected(true);
            setConnectionError(null);
          }
        });

        ably.connection.on("disconnected", () => {
          if (mounted) {
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
      const { content, citations, hasCitations, messageId, timestamp } =
        message.data;

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];

        if (lastMessage && lastMessage.role === "assistant") {
          // Use the full content from server (now contains the complete response)
          lastMessage.content = content;
          lastMessage.citations = hasCitations ? citations : undefined;
          lastMessage.hasCitations = hasCitations || false;
          lastMessage.completed = true;
          lastMessage.timestamp = new Date(timestamp);
          if (messageId) {
            lastMessage.id = messageId;
          }
        }

        return newMessages;
      });

      setIsLoading(false);
    };

    const handleAiStarted = () => {
      setIsLoading(true);
    };

    const handleAiCompleted = () => {
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
      ablyRef.current.close();
      ablyRef.current = null;
    }
    setIsConnected(false);
    setConnectionError(null);
  };

  const sendMessage = async (message, chatId, retryCount = 0) => {
    const maxRetries = 3;

    try {
      setIsLoading(true);

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

        if (response.status === 429 && errorData.rateLimited) {
          // Kept this log as it's an important, non-standard event to monitor
          console.log("Rate limit exceeded:", errorData);

          setMessages((prev) => [
            ...prev,
            {
              id: `rate-limit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              role: "assistant",
              content: `⚠️ **Rate Limit Exceeded**\n\n${errorData.error}\n\n${
                errorData.usage?.tier === "unauthenticated"
                  ? "Sign in to get 25 messages every 12 hours!"
                  : errorData.usage?.tier === "free"
                    ? "Upgrade to Premium for 50 messages every 12 hours!"
                    : "Your usage will reset in a few hours."
              }`,
              timestamp: new Date(),
              completed: true,
              isRateLimitError: true,
            },
          ]);

          setIsLoading(false);
          return false;
        }

        throw new Error(
          `AI processing failed: ${response.status} - ${errorData.error || "Unknown error"}`,
        );
      }

      const result = await response.json();

      if (typeof window !== "undefined" && window.refreshUsageIndicator) {
        window.refreshUsageIndicator();
      }

      return true;
    } catch (error) {
      console.error("Failed to send message:", error);

      // Check if this is a fetch failed error and we haven't exceeded retry limit
      if (error.message.includes("fetch failed") && retryCount < maxRetries) {
        console.log(
          `Retrying request (attempt ${retryCount + 1}/${maxRetries})...`,
        );
        // Wait a bit before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1)),
        );
        return sendMessage(message, chatId, retryCount + 1);
      }

      setIsLoading(false);

      // Show user-friendly error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: "assistant",
          content: error.message.includes("fetch failed")
            ? "⚠️ **Connection Error**\n\nThere was a temporary connection issue. This is common in development mode. Please try sending your message again."
            : `⚠️ **Error**\n\n${error.message}\n\nPlease try again.`,
          timestamp: new Date(),
          completed: true,
          isError: true,
        },
      ]);

      return false;
    }
  };

  return {
    isConnected,
    connectionError,
    sendMessage,
  };
}
