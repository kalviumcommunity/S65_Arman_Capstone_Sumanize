"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import Sidebar from "@/components/Sidebar";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const isAuthenticated = status === "authenticated";

  // Create new chat function
  const createNewChat = async () => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        const newChat = await res.json();
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.chatId);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  // Load user's chats when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadChats = async () => {
      try {
        const res = await fetch('/api/chats');
        const data = await res.json();
        setChats(data);
        
        // If user has chats, select the most recent one
        if (data.length > 0) {
          setActiveChatId(data[0].chatId);
        } else {
          // Create first chat for new users
          await createNewChat();
        }
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    };

    loadChats();
  }, [isAuthenticated]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChatId) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${activeChatId}`);
        const chat = await res.json();
        setMessages(chat.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [activeChatId]);

  // Setup WebSocket connection with enhanced stability and reconnection
  useEffect(() => {
    if (!isAuthenticated || !activeChatId || !session?.user?.id) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout = null;
    let connectionId = null;

    const connectWebSocket = () => {
      // Clear any existing connection
      if (ws.current) {
        ws.current.removeAllListeners?.();
        if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
          ws.current.close();
        }
      }

      try {
        connectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        console.log(`🔗 Connecting WebSocket ${connectionId} for chat ${activeChatId}, user ${session.user.id}`);
        
        ws.current = new WebSocket(`ws://localhost:3001?chatId=${activeChatId}&userId=${session.user.id}`);

        // Connection opened successfully
        ws.current.onopen = () => {
          console.log(`✅ WebSocket ${connectionId} connected successfully`);
          reconnectAttempts = 0;
          setIsLoading(false);
        };

        // Message handler with enhanced error handling
        ws.current.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.error) {
              console.error(`❌ WebSocket error from server:`, data.error);
              if (data.details) {
                console.error(`Error details:`, data.details);
              }
              setIsLoading(false);
              return;
            }

            if (data.type === "chunk") {
              // Update the last assistant message with new chunk
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content += data.text;
                } else {
                  newMessages.push({
                    id: `temp-${Date.now()}`,
                    role: "assistant",
                    content: data.text,
                    timestamp: new Date()
                  });
                }
                
                return newMessages;
              });
            }

            if (data.type === "complete") {
              // Save the complete assistant message to database
              try {
                const res = await fetch(`/api/chats/${activeChatId}/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    role: "assistant",
                    content: data.content
                  })
                });
                
                if (res.ok) {
                  const savedMessage = await res.json();
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === "assistant") {
                      newMessages[newMessages.length - 1] = savedMessage;
                    }
                    return newMessages;
                  });
                } else {
                  console.error('Failed to save assistant message:', res.status, res.statusText);
                }
              } catch (error) {
                console.error('Error saving assistant message:', error);
              }
              
              setIsLoading(false);
              console.log(`✅ Response completed for ${connectionId} (${data.totalChunks || 0} chunks)`);
            }
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError);
            setIsLoading(false);
          }
        };

        // Connection closed handler with reconnection logic
        ws.current.onclose = (event) => {
          console.log(`🔌 WebSocket ${connectionId} disconnected: code=${event.code}, reason=${event.reason || 'none'}`);
          setIsLoading(false);
          
          // Only attempt reconnection for unexpected closures
          if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff, max 10s
            console.log(`🔄 Scheduling reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts} in ${delay}ms`);
            
            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++;
              console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
              connectWebSocket();
            }, delay);
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.error(`❌ Max reconnection attempts (${maxReconnectAttempts}) reached. Connection failed.`);
          }
        };

        // Connection error handler
        ws.current.onerror = (error) => {
          console.error(`❌ WebSocket ${connectionId} connection error:`, error);
          setIsLoading(false);
        };

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
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
        console.log(`🔌 Cleaning up WebSocket ${connectionId}`);
        ws.current.removeAllListeners?.();
        
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.close(1000, "Component unmounting");
        }
        ws.current = null;
      }
    };
  }, [isAuthenticated, activeChatId, session?.user?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || !activeChatId || isLoading) return;

    const messageContent = input.trim();
    if (messageContent.length > 4000) {
      alert("Message too long. Please keep it under 4000 characters.");
      return;
    }

    const userMessage = {
      role: "user",
      content: messageContent
    };

    setIsLoading(true);
    setInput("");

    try {
      // Save user message to database with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userMessage),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const savedMessage = await res.json();
      setMessages(prev => [...prev, savedMessage]);

      // Enhanced WebSocket message sending with retry logic
      const sendViaWebSocket = (retries = 3) => {
        if (!ws.current) {
          console.error("❌ WebSocket connection not available");
          setIsLoading(false);
          return;
        }

        const wsState = ws.current.readyState;
        
        if (wsState === WebSocket.OPEN) {
          try {
            ws.current.send(JSON.stringify({
              type: "message",
              content: userMessage.content,
              chatId: activeChatId,
              timestamp: Date.now()
            }));
            console.log(`📤 Message sent via WebSocket for chat ${activeChatId}`);
          } catch (sendError) {
            console.error("❌ Failed to send message via WebSocket:", sendError);
            setIsLoading(false);
          }
        } else if (wsState === WebSocket.CONNECTING && retries > 0) {
          console.log(`⏳ WebSocket connecting, retrying in 500ms (${retries} attempts left)`);
          setTimeout(() => sendViaWebSocket(retries - 1), 500);
        } else {
          console.error(`❌ WebSocket not ready, state: ${wsState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`);
          setIsLoading(false);
        }
      };

      sendViaWebSocket();

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setInput(messageContent); // Restore input on failure
      setIsLoading(false);
      
      if (error.name === 'AbortError') {
        alert("Request timed out. Please try again.");
      } else {
        alert("Failed to send message. Please try again.");
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-neutral-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to AI Chat</h1>
        <p className="text-neutral-400 mb-8">Sign in to start chatting with AI</p>
        <button
          onClick={() => signIn("github")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-900 text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-800 bg-neutral-900">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onCreateChat={createNewChat}
          onSelectChat={selectChat}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-neutral-800 p-4 border-b border-neutral-700">
          <h1 className="text-xl font-semibold">
            {chats.find(chat => chat.chatId === activeChatId)?.title || "AI Chat"}
          </h1>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-neutral-400">
                <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
                <p>Send a message to begin chatting with AI</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-700 text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-700 text-white px-4 py-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input */}
        <footer className="bg-neutral-800 p-4 border-t border-neutral-700">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}
