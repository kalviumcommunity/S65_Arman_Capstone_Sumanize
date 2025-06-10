"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input component
import ChatList from "./chat-list";
import UserProfile from "./user-profile";
import MessageCountDisplay from "./message-count-display";
import { Sparkle } from "@phosphor-icons/react";
import { Search } from "lucide-react"; // Import Search icon
import { useState } from "react"; // Import useState for search state

export default function ChatSidebar({
  session,
  chats,
  currentChatId,
  messageCount,
  limit,
  isLimitReached,
  isAuthenticated,
  onNewChat,
  onChatSelect,
  onChatDelete,
  onSignIn,
}) {
  // Add state for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats based on search query
  const filteredChats = chats.filter(
    (chat) =>
      chat.title &&
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full w-full flex-col bg-neutral-900/50 p-4">
      {/* App Header/Logo */}
      <div className="mt-4 mb-8 flex items-center justify-center gap-x-2">
        <Sparkle weight="fill" className="h-8 w-8" />
        <h1 className="font-serif text-4xl">Sumanize</h1>
      </div>

      {/* New Chat Button */}
      <Button
        onClick={onNewChat}
        className="w-full text-base text-neutral-950 bg-neutral-200 hover:bg-neutral-300 cursor-pointer"
      >
        New Chat
      </Button>

      {/* Search Input */}
      <div className="relative mt-4 mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
        <Input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 text-sm placeholder:text-neutral-400 focus-visible:ring-0 border-none"
        />
      </div>

      {/* Chat List takes up the available space */}
      <div className="my-4 flex-1 overflow-y-auto">
        <ChatList
          chats={filteredChats}
          currentChatId={currentChatId}
          onChatSelect={onChatSelect}
          onChatDelete={onChatDelete}
        />
        {filteredChats.length === 0 && searchQuery && (
          <p className="text-center text-sm text-neutral-400 mt-4">
            No chats found
          </p>
        )}
      </div>

      {/* User Profile is now at the bottom */}
      <UserProfile session={session} onSignIn={onSignIn} />

      {/* Message Count Display is at the very bottom */}
      <MessageCountDisplay
        messageCount={messageCount}
        limit={limit}
        isLimitReached={isLimitReached}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
