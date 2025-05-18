"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, StarFour } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/chat-context";
import { Separator } from "@/components/ui/separator";

export default function Sidebar({
  selectedIds,
  setSelectedIds,
  sidebarWidth,
  setSidebarWidth,
  user,
}) {
  const {
    conversations,
    currentConversationId,
    startNewConversation,
    selectConversation,
  } = useChat();

  const [search, setSearch] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const router = useRouter();

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

  const handleNewChat = async () => {
    if (!user) {
      document.dispatchEvent(new CustomEvent("show-auth-toast"));
      return;
    }

    const emptyConversation = conversations.find(
      (c) => c.messages.length === 0,
    );

    if (emptyConversation) {
      selectConversation(emptyConversation.id);
    } else {
      await startNewConversation();
    }
  };

  const conversationTabClass =
    "w-full mb-2 p-3 rounded-md flex items-center justify-between min-w-0 cursor-pointer border-neutral-700 transition-colors duration-150 text-left";

  return (
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
          onClick={handleNewChat}
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

        <Separator className="w-full bg-neutral-800 rounded-md mb-4" />

        <ScrollArea className="h-[calc(100vh-220px)]">
          {!user && filteredConversations.length > 0 && (
            <div className="mb-3 px-2 py-2 bg-neutral-900/50 rounded-md text-sm text-neutral-500">
              These conversations are temporary. If you want to save them, then
              <button
                className="text-neutral-400 hover:underline ml-1 cursor-pointer"
                onClick={() =>
                  document.dispatchEvent(
                    new CustomEvent("open-auth-modal", {
                      detail: { tab: "register" },
                    }),
                  )
                }
              >
                authenticate
              </button>
              .
            </div>
          )}

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
                    {conversation.title || getConversationPreview(conversation)}
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
                alt="Premium Plan"
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

      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-neutral-800 active:bg-neutral-800"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
