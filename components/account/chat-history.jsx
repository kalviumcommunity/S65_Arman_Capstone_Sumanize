"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChatCircle,
  Calendar,
  TrashSimple,
  Clock,
  ArrowRight,
  Empty,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function ChatHistory({ onUsageUpdate }) {
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchRecentChats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/chats?limit=12");
      if (response.ok) {
        const chats = await response.json();
        setRecentChats(chats);
      }
    } catch (error) {
      console.error("Failed to fetch recent chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllChats = async () => {
    try {
      const response = await fetch("/api/chats", { method: "DELETE" });
      if (response.ok) {
        setRecentChats([]);
        onUsageUpdate?.();
      }
    } catch (error) {
      console.error("Failed to delete all chats:", error);
    }
  };

  const handleChatClick = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  useEffect(() => {
    fetchRecentChats();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-comet-900/60 to-comet-800/40 border-comet-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <ChatCircle size={24} className="text-comet-400" />
            <span>Chat History</span>
            <span className="text-sm font-normal text-comet-500">
              ({recentChats.length} chats)
            </span>
          </CardTitle>
          {recentChats.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-800/50 hover:bg-red-950/30 hover:border-red-700 transition-all duration-200"
                >
                  <TrashSimple size={14} className="mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-comet-950 border-comet-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400">
                    Clear All Chats
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-comet-300">
                    This will permanently delete all your chat history. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-comet-800 text-comet-100 border-comet-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllChats}
                    className="bg-red-900 hover:bg-red-800"
                  >
                    Delete All Chats
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-comet-600 border-t-comet-300 rounded-full" />
          </div>
        ) : recentChats.length === 0 ? (
          <div className="text-center py-12">
            <Empty size={64} className="mx-auto mb-4 text-comet-600" />
            <h3 className="text-lg font-medium text-comet-300 mb-2">
              No Chat History
            </h3>
            <p className="text-comet-500 mb-6">
              Start a conversation to see your chat history here
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-comet-700 hover:bg-comet-600 text-comet-100"
            >
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3">
              {recentChats.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => handleChatClick(chat.chatId)}
                  className="group p-4 bg-comet-800/30 hover:bg-comet-800/50 border border-comet-700/50 hover:border-comet-600 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-comet-100 truncate group-hover:text-white transition-colors">
                        {chat.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-comet-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(chat.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-comet-500 group-hover:text-comet-300 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            {recentChats.length >= 12 && (
              <div className="text-center pt-4 border-t border-comet-800">
                <p className="text-sm text-comet-500">
                  Showing recent 12 chats. Older chats are still available in
                  the sidebar.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
