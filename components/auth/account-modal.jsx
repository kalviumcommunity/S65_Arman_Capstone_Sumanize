"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  User,
  SignOut,
  Timer,
  Paperclip,
  TrashSimple,
  ChatCircle,
  Keyboard,
  Warning,
  Sun,
  Calendar,
  FileText,
} from "@phosphor-icons/react";

export function AccountModal({ isOpen, onClose, user, usage, onUsageUpdate }) {
  const [activeTab, setActiveTab] = useState("account");
  const [recentChats, setRecentChats] = useState([]);
  const [recentAttachments, setRecentAttachments] = useState([]);
  const [loading, setLoading] = useState({ chats: false, attachments: false });

  const firstLetter =
    user && user.name && typeof user.name === "string"
      ? user.name.charAt(0).toUpperCase()
      : "?";

  // Fetch recent chats
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

  // Fetch recent attachments (pasted content)
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

  // Delete all chats
  const handleDeleteAllChats = async () => {
    try {
      const response = await fetch("/api/chats", { method: "DELETE" });
      if (response.ok) {
        setRecentChats([]);
        // Refresh usage after deletion
        onUsageUpdate?.();
      }
    } catch (error) {
      console.error("Failed to delete all chats:", error);
    }
  };

  // Delete all attachments
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

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/delete", { method: "DELETE" });
      if (response.ok) {
        await signOut({ redirect: true });
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentChats();
      fetchRecentAttachments();
    }
  }, [isOpen]);

  if (!usage) return null;

  const percentage = (usage.used / usage.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  const remaining = Math.max(0, usage.limit - usage.used);

  const getTierColor = (tier) => {
    switch (tier) {
      case "premium":
        return "bg-yellow-500";
      case "free":
        return "bg-blue-500";
      case "unauthenticated":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case "premium":
        return "Premium";
      case "free":
        return "Free";
      case "unauthenticated":
        return "Guest";
      default:
        return "Unknown";
    }
  };

  const keyboardShortcuts = [
    { key: "Ctrl/Cmd + K", description: "Open command palette" },
    { key: "Ctrl/Cmd + /", description: "Toggle sidebar" },
    { key: "Ctrl/Cmd + N", description: "New chat" },
    { key: "Enter", description: "Send message" },
    { key: "Shift + Enter", description: "New line" },
    { key: "Escape", description: "Close modals" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-[90vw] max-h-[85vh] bg-comet-950 border-comet-800 text-comet-100 shadow-xl overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            Account Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3 bg-comet-900/50 border border-comet-800 rounded-xl p-1">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-comet-800 data-[state=active]:text-comet-100 data-[state=active]:shadow-sm rounded-lg"
            >
              <User size={16} className="mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-comet-800 data-[state=active]:text-comet-100 data-[state=active]:shadow-sm rounded-lg"
            >
              <Timer size={16} className="mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="data-[state=active]:bg-comet-800 data-[state=active]:text-comet-100 data-[state=active]:shadow-sm rounded-lg"
            >
              <Paperclip size={16} className="mr-2" />
              Attachments
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-6">
            <TabsContent
              value="account"
              className="h-full overflow-y-auto pr-2"
            >
              <div className="space-y-6">
                {/* User Profile */}
                <Card className="bg-comet-900/50 border-comet-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-comet-800">
                        <AvatarFallback className="bg-comet-800 text-comet-100 text-lg">
                          {firstLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-lg font-medium text-comet-100">
                          {user.name}
                        </div>
                        <div className="text-sm text-comet-400">
                          {user.email}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Usage Stats */}
                <Card className="bg-comet-900/50 border-comet-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-comet-100">
                        Daily Usage
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getTierColor(usage.tier)} text-white`}
                      >
                        {getTierLabel(usage.tier)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-comet-300">Messages Used</span>
                        <span className="text-comet-100">
                          {usage.used}/{usage.limit}
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                        style={{
                          "--progress-background": isAtLimit
                            ? "#ef4444"
                            : isNearLimit
                              ? "#f59e0b"
                              : "#10b981",
                        }}
                      />
                      <div className="flex justify-between text-xs">
                        <span
                          className={`font-medium ${
                            remaining === 0
                              ? "text-red-400"
                              : remaining <= 1
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        >
                          {remaining} remaining
                        </span>
                        <span className="text-comet-500">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>

                    {isAtLimit && (
                      <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 rounded-md p-2">
                        <Warning size={14} />
                        <span>Daily limit reached</span>
                      </div>
                    )}

                    {isNearLimit && !isAtLimit && (
                      <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-950/30 rounded-md p-2">
                        <Sun size={14} />
                        <span>Approaching limit</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Keyboard Shortcuts */}
                <Card className="bg-comet-900/50 border-comet-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-comet-100">
                      <Keyboard size={20} />
                      Keyboard Shortcuts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {keyboardShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="text-sm text-comet-300">
                            {shortcut.description}
                          </span>
                          <kbd className="px-2 py-1 text-xs bg-comet-800 text-comet-100 rounded border border-comet-700">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="w-full text-comet-100 border-comet-700 hover:bg-comet-800"
                  >
                    <SignOut size={16} className="mr-2" />
                    Sign Out
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full bg-red-900 hover:bg-red-800 text-white"
                      >
                        <TrashSimple size={16} className="mr-2" />
                        Delete Account Permanently
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-comet-950 border-comet-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-comet-300">
                          This action cannot be undone. This will permanently
                          delete your account, all your chat history, and remove
                          all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-comet-800 text-comet-100 border-comet-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-900 hover:bg-red-800"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="history"
              className="h-full overflow-y-auto pr-2"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-comet-100">
                    Recent Chats
                  </h3>
                  {recentChats.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-800 hover:bg-red-950/30"
                        >
                          <TrashSimple size={14} className="mr-1" />
                          Clear All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-comet-950 border-comet-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-400">
                            Clear All Chats
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-comet-300">
                            This will permanently delete all your chat history.
                            This action cannot be undone.
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

                {loading.chats ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-comet-600 border-t-comet-300 rounded-full" />
                  </div>
                ) : recentChats.length === 0 ? (
                  <div className="text-center py-8 text-comet-400">
                    <ChatCircle size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No chat history found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentChats.map((chat) => (
                      <Card
                        key={chat.chatId}
                        className="bg-comet-900/50 border-comet-800"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-comet-100 truncate">
                                {chat.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-comet-400">
                                <Calendar size={12} />
                                {new Date(chat.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="attachments"
              className="h-full overflow-y-auto pr-2"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-comet-100">
                    Recent Attachments
                  </h3>
                  {recentAttachments.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-800 hover:bg-red-950/30"
                        >
                          <TrashSimple size={14} className="mr-1" />
                          Clear All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-comet-950 border-comet-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-400">
                            Clear All Attachments
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-comet-300">
                            This will permanently delete all your pasted
                            content. This action cannot be undone.
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

                {loading.attachments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-comet-600 border-t-comet-300 rounded-full" />
                  </div>
                ) : recentAttachments.length === 0 ? (
                  <div className="text-center py-8 text-comet-400">
                    <FileText size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No attachments found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentAttachments.map((attachment) => (
                      <Card
                        key={attachment.id}
                        className="bg-comet-900/50 border-comet-800"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-comet-100">
                                {attachment.title || "Pasted Content"}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-comet-400">
                                <FileText size={12} />
                                {attachment.size} characters
                                <Calendar size={12} className="ml-2" />
                                {new Date(
                                  attachment.createdAt,
                                ).toLocaleDateString()}
                              </div>
                              <p className="text-sm text-comet-300 mt-2 line-clamp-2">
                                {attachment.preview}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
