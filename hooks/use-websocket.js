import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function useWebSocket(
  activeChatId,
  isNewChatPending,
  setMessages,
  setIsLoading,
) {
  const { data: session } = useSession();
  const ws = useRef(null);

  const isAuthenticated = session?.user?.id;

  useEffect(() => {
    if (!isAuthenticated || !activeChatId || isNewChatPending) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout = null;
    let connectionId = null;

    const connectWebSocket = () => {
      // Clear any existing connection
      if (ws.current) {
        ws.current.removeAllListeners?.();
        if (
          ws.current.readyState === WebSocket.OPEN ||
          ws.current.readyState === WebSocket.CONNECTING
        ) {
          ws.current.close();
        }
      }

      try {
        connectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        ws.current = new WebSocket(
          `ws://localhost:3001?chatId=${activeChatId}&userId=${session.user.id}`,
        );

        // Connection opened successfully
        ws.current.onopen = () => {
          console.log(`WebSocket ${connectionId} connected`);
          reconnectAttempts = 0;
          setIsLoading(false);
        };

        // Message handler with enhanced error handling
        ws.current.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.error) {
              console.error(`WebSocket error from server:`, data.error);
              if (data.details) {
                console.error(`Error details:`, data.details);
              }
              setIsLoading(false);
              return;
            }

            if (data.type === "chunk") {
              // Update the last assistant message with new chunk
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];

                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content += data.text;
                } else {
                  newMessages.push({
                    id: `temp-${Date.now()}`,
                    role: "assistant",
                    content: data.text,
                    timestamp: new Date(),
                  });
                }

                return newMessages;
              });
            }

            if (data.type === "complete") {
              // Save the complete assistant message to database
              try {
                const res = await fetch(`/api/chats/${activeChatId}/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    role: "assistant",
                    content: data.content,
                  }),
                });

                if (res.ok) {
                  const savedMessage = await res.json();
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === "assistant") {
                      newMessages[newMessages.length - 1] = savedMessage;
                    }
                    return newMessages;
                  });
                } else {
                  console.error(
                    "Failed to save assistant message:",
                    res.status,
                    res.statusText,
                  );
                }
              } catch (error) {
                console.error("Error saving assistant message:", error);
              }

              setIsLoading(false);
              console.log(
                `Response completed for ${connectionId} (${data.totalChunks || 0} chunks)`,
              );
            }
          } catch (parseError) {
            console.error("Error parsing WebSocket message:", parseError);
            setIsLoading(false);
          }
        };

        // Connection closed handler with reconnection logic
        ws.current.onclose = (event) => {
          console.log(
            `WebSocket ${connectionId} disconnected: code=${event.code}, reason=${event.reason || "none"}`,
          );
          setIsLoading(false);

          // Only attempt reconnection for unexpected closures
          if (
            event.code !== 1000 &&
            event.code !== 1001 &&
            reconnectAttempts < maxReconnectAttempts
          ) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts),
              10000,
            ); // Exponential backoff, max 10s
            console.log(
              `Scheduling reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts} in ${delay}ms`,
            );

            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++;
              console.log(
                `Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`,
              );
              connectWebSocket();
            }, delay);
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.error(
              `Max reconnection attempts (${maxReconnectAttempts}) reached. Connection failed.`,
            );
          }
        };

        // Connection error handler
        ws.current.onerror = (error) => {
          console.error(`WebSocket ${connectionId} connection error:`, error);
          setIsLoading(false);
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        setIsLoading(false);
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      if (ws.current) {
        console.log(`Cleaning up WebSocket ${connectionId}`);
        ws.current.removeAllListeners?.();

        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.close(1000, "Component unmounting");
        }
        ws.current = null;
      }
    };
  }, [
    isAuthenticated,
    activeChatId,
    session?.user?.id,
    isNewChatPending,
    setMessages,
    setIsLoading,
  ]);

  return { ws };
}
