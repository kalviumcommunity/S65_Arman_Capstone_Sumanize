"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import ChatDisplay from "@/components/summarize/ui-interface";
import InputArea from "@/components/summarize/input-area";
import CommandPalette from "@/components/summarize/cmdk";
import { ChatProvider, useChat } from "@/context/chat-context";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, StarFour } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function SummarizeContent() {
  const {
    conversations,
    currentConversationId,
    activeMessages,
    startNewConversation,
    selectConversation,
    deleteConversation,
    isLoading,
    submitQuery,
  } = useChat();

  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sumanize_sidebar_width");
    if (saved) setSidebarWidth(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem("sumanize_sidebar_width", sidebarWidth.toString());
  }, [sidebarWidth]);

  const handleMouseDown = () => {
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
  };
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const x = e.clientX;
    if (x > 200 && x < 500) setSidebarWidth(x);
  };
  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = "";
  };
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Delete" && selectedIds.length > 0) {
        e.preventDefault();
        setIsDeleteDialogOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds]);

  const handleSubmitText = async (text) => {
    try {
      await submitQuery("/api/summarize", { text });
    } catch (err) {
      toast.error("Failed to get summary: " + err.message);
    }
  };

  const getConversationPreview = (conversation) => {
    if (conversation?.messages?.length > 0) {
      const firstUser = conversation.messages.find((m) => m.type === "user");
      if (firstUser?.data?.text) {
        const t = firstUser.data.text;
        return t.length > 30 ? t.slice(0, 30) + "…" : t;
      }
    }
    return "New conversation";
  };

  const filteredConversations = search
    ? conversations.filter((c) => {
        const title = (c.title || "").toLowerCase();
        const preview = getConversationPreview(c).toLowerCase();
        return (
          title.includes(search.toLowerCase()) ||
          preview.includes(search.toLowerCase())
        );
      })
    : conversations;

  const handleTabClick = (e, convoId) => {
    const multi = e.ctrlKey || e.metaKey;
    if (multi) {
      setSelectedIds((prev) =>
        prev.includes(convoId)
          ? prev.filter((id) => id !== convoId)
          : [...prev, convoId],
      );
    } else {
      setSelectedIds([convoId]);
      selectConversation(convoId);
    }
  };

  const conversationTabClass =
    "w-full mb-2 p-3 rounded-md flex items-center justify-between min-w-0 cursor-pointer border-neutral-700 transition-colors duration-150 text-left";
  const router = useRouter();

  return (
    <div className="bg-neutral-900 min-h-screen flex h-screen relative">
      {/* <CommandPalette /> */}

      {/* Sidebar */}
      <div
        className="flex flex-col h-full bg-neutral-950 border-none relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-4 flex-shrink-0 h-full flex flex-col">
          <div className="flex items-center justify-center mb-4 p-4">
            <h1 className="text-3xl font-serif text-neutral-300 text-center tracking-wide flex items-center gap-1">
              <StarFour size={28} className="text-neutral-300" />
              Sumanize
            </h1>
          </div>

          <Button
            onClick={startNewConversation}
            className="w-full mb-4 bg-neutral-300 hover:bg-neutral-400 text-neutral-950 rounded-md text-base font-medium transition-colors duration-300 ease-in-out cursor-pointer"
            style={{ minHeight: 36, height: 36, maxHeight: 36 }}
          >
            New Chat
          </Button>

          <div className="mb-4">
            <div className="relative w-full">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-10 pr-3 py-3 rounded-md bg-transparent border-none text-neutral-500 placeholder:text-neutral-500 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none"
                style={{ minHeight: 36, height: 36, maxHeight: 36 }}
              />
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-0">
              {filteredConversations.map((conversation, idx) => {
                const id = conversation.id || conversation._id || idx;
                const isActive = currentConversationId === id;
                const isSelected = selectedIds.includes(id);

                return (
                  <div
                    key={id}
                    onClick={(e) => handleTabClick(e, id)}
                    className={cn(
                      conversationTabClass,
                      "group relative",
                      isSelected
                        ? "bg-neutral-800/50"
                        : isActive
                          ? "bg-neutral-900/50 hover:bg-neutral-900"
                          : "bg-transparent hover:bg-neutral-900/50",
                    )}
                    style={{ minHeight: 36, height: 36, maxHeight: 36 }}
                  >
                    <span className="truncate text-sm text-neutral-300 flex-1 mr-1 min-w-0">
                      {conversation.title ||
                        getConversationPreview(conversation)}
                    </span>
                    <div className="absolute right-0 top-0 h-full w-100 bg-gradient-to-r from-transparent to-neutral-950 pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="absolute bottom-4 left-0 w-full px-4 z-20 flex justify-center">
          <button
            onClick={() => router.push("/plan")}
            className="w-full max-w-sm rounded-md overflow-hidden bg-neutral-900 text-neutral-300 transition cursor-pointer"
            style={{ display: "block" }}
          >
            <div className="relative w-full h-32 rounded-md border-8 border-neutral-900">
              <div className="absolute inset-0 rounded-md overflow-hidden">
                <Image
                  src="/images/upgrade-plan.jpg"
                  alt="Upgrade Plan Banner"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex items-center justify-center bg-neutral-800 rounded-md h-10 w-10">
                <StarFour size={24} className="text-neutral-300" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-base text-neutral-300">Go Premium</span>
                <span className="text-xs text-neutral-400">
                  Even faster summaries.
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Sidebar resize gutter */}
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-neutral-800 active:bg-neutral-800"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Main chat area */}
      <main
        className="flex flex-col h-full bg-neutral-200 overflow-hidden relative"
        style={{ width: `calc(100% - ${sidebarWidth}px)` }}
      >
        <div className="flex-grow flex flex-col h-full bg-neutral-900">
          <ChatDisplay messages={activeMessages} />
        </div>
        <div className="absolute bottom-0 left-0 w-full px-0 pb-0 z-30">
          <InputArea onSubmit={handleSubmitText} isLoading={isLoading} />
        </div>
      </main>

      {/* Bulk delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-neutral-900 border-2 border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">
              Delete {selectedIds.length} conversation
              {selectedIds.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-300">
              This will permanently delete the selected conversation
              {selectedIds.length > 1 ? "s" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none bg-neutral-800 hover:bg-neutral-700 text-zinc-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-neutral-300 hover:bg-neutral-400 text-neutral-800"
              onClick={async () => {
                for (const id of selectedIds) {
                  await deleteConversation(id);
                }
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
                toast.success("Deleted");
              }}
            >
              Delete Chat{selectedIds.length > 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SummarizePage() {
  return (
    <ChatProvider>
      <SummarizeContent />
    </ChatProvider>
  );
}
