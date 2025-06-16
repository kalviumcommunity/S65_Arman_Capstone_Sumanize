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
  Paperclip,
  FileText,
  Copy,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function HistoryAndAttachments({ onUsageUpdate }) {
  const [recentChats, setRecentChats] = useState([]);
  const [recentAttachments, setRecentAttachments] = useState([]);
  const [loading, setLoading] = useState({ chats: false, attachments: false });
  const router = useRouter();

  const fetchRecentChats = async () => {
    try {
      setLoading((prev) => ({ ...prev, chats: true }));
      const response = await fetch("/api/chats?limit=8");
      if (response.ok) {
        const chats = await response.json();
        setRecentChats(chats);
      }
    } catch (error) {
      console.error("Failed to fetch recent chats:", error);
    } finally {
      setLoading((prev) => ({ ...prev, chats: false }));
    }
  };

  const fetchRecentAttachments = async () => {
    try {
      setLoading((prev) => ({ ...prev, attachments: true }));
      const response = await fetch("/api/attachments?limit=8");
      if (response.ok) {
        const attachments = await response.json();
        setRecentAttachments(attachments);
      }
    } catch (error) {
      console.error("Failed to fetch recent attachments:", error);
    } finally {
      setLoading((prev) => ({ ...prev, attachments: false }));
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

  const handleDeleteAllAttachments = async () => {
    try {
      const response = await fetch("/api/attachments", { method: "DELETE" });
      if (response.ok) {
        setRecentAttachments([]);
      }
    } catch (error) {
      console.error("Failed to delete all attachments:", error);
    }
  };

  const handleChatClick = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  const handleCopyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy content:", error);
    }
  };

  useEffect(() => {
    fetchRecentChats();
    fetchRecentAttachments();
  }, []);

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} chars`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)}K chars`;
    return `${(size / 1048576).toFixed(1)}M chars`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Chat History Card */}
      <Card className="bg-gradient-to-br from-comet-900/60 to-comet-800/40 border-comet-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <ChatCircle size={24} className="text-comet-400" />
              <span>Chat History</span>
              <span className="text-sm font-normal text-comet-500">
                ({recentChats.length})
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
          {loading.chats ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-comet-600 border-t-comet-300 rounded-full" />
            </div>
          ) : recentChats.length === 0 ? (
            <div className="text-center py-8">
              <Empty size={48} className="mx-auto mb-3 text-comet-600" />
              <h3 className="text-lg font-medium text-comet-300 mb-2">
                No Chat History
              </h3>
              <p className="text-comet-500 text-sm">
                Start a conversation to see your chats here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentChats.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => handleChatClick(chat.chatId)}
                  className="group p-3 bg-comet-800/30 hover:bg-comet-800/50 border border-comet-700/50 hover:border-comet-600 rounded-lg cursor-pointer transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-comet-100 truncate text-sm group-hover:text-white transition-colors">
                        {chat.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-comet-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(chat.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-comet-500 group-hover:text-comet-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments Card */}
      <Card className="bg-gradient-to-br from-comet-900/60 to-comet-800/40 border-comet-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <Paperclip size={24} className="text-comet-400" />
              <span>Attachments</span>
              <span className="text-sm font-normal text-comet-500">
                ({recentAttachments.length})
              </span>
            </CardTitle>
            {recentAttachments.length > 0 && (
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
                      Clear All Attachments
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-comet-300">
                      This will permanently delete all your pasted content. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-comet-800 text-comet-100 border-comet-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllAttachments}
                      className="bg-red-900 hover:bg-red-800"
                    >
                      Delete All Attachments
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading.attachments ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-comet-600 border-t-comet-300 rounded-full" />
            </div>
          ) : recentAttachments.length === 0 ? (
            <div className="text-center py-8">
              <Empty size={48} className="mx-auto mb-3 text-comet-600" />
              <h3 className="text-lg font-medium text-comet-300 mb-2">
                No Attachments
              </h3>
              <p className="text-comet-500 text-sm">
                Paste content in chat to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group p-3 bg-comet-800/30 hover:bg-comet-800/50 border border-comet-700/50 hover:border-comet-600 rounded-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText
                        size={14}
                        className="text-comet-400 flex-shrink-0"
                      />
                      <h4 className="font-medium text-comet-100 truncate text-sm">
                        {attachment.title || "Pasted Content"}
                      </h4>
                    </div>
                    <Button
                      onClick={() =>
                        handleCopyContent(
                          attachment.content || attachment.preview,
                        )
                      }
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                    >
                      <Copy size={12} className="text-comet-400" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 mb-2 text-xs text-comet-400">
                    <span>{formatFileSize(attachment.size)}</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(attachment.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-comet-800/40 rounded p-2">
                    <p className="text-xs text-comet-300 line-clamp-2 font-mono">
                      {attachment.preview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
