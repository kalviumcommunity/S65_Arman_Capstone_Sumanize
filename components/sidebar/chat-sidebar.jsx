"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { SidebarHeader, NewChatButton } from "./sidebar-header";
import { SearchInput } from "./search-input";
import { ChatList } from "./chat-list";
import { AuthButtons } from "./auth-buttons";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import UserAccount from "./user-account";

export function ChatSidebar({
  chats = [],
  activeChatId,
  onCreateChat,
  onSelectChat,
  onDeleteChat,
  isNewChatPending = false,
}) {
  const { data: session } = useSession();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [pinnedChatIds, setPinnedChatIds] = useState(new Set());
  const isInitialMount = useRef(true);

  useEffect(() => {
    try {
      const savedPinnedChats = localStorage.getItem("pinned-chats");
      if (savedPinnedChats) {
        setPinnedChatIds(new Set(JSON.parse(savedPinnedChats)));
      }
    } catch (error) {
      console.error("Error loading pinned chats from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      localStorage.setItem(
        "pinned-chats",
        JSON.stringify(Array.from(pinnedChatIds)),
      );
    } catch (error) {
      console.error("Error saving pinned chats to localStorage:", error);
    }
  }, [pinnedChatIds]);

  const handleDeleteClick = (chatId) => {
    setShowDeleteConfirm(chatId);
  };

  const confirmDelete = async (chatId) => {
    setPinnedChatIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(chatId);
      return newSet;
    });

    if (onDeleteChat) {
      await onDeleteChat(chatId);
    }
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handlePinToggle = (chatId, isPinned) => {
    setPinnedChatIds((prev) => {
      const newSet = new Set(prev);
      if (isPinned) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const chatDate = new Date(date);
    return (
      chatDate.getDate() === today.getDate() &&
      chatDate.getMonth() === today.getMonth() &&
      chatDate.getFullYear() === today.getFullYear()
    );
  };

  const chatsWithPinStatus = chats.map((chat) => ({
    ...chat,
    isPinned: pinnedChatIds.has(chat.chatId),
  }));

  const filteredChats = chatsWithPinStatus.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned);
  const todayChats = filteredChats.filter(
    (chat) => !chat.isPinned && chat.createdAt && isToday(chat.createdAt),
  );
  const olderChats = filteredChats.filter(
    (chat) => !chat.isPinned && (!chat.createdAt || !isToday(chat.createdAt)),
  );

  return (
    <div className="relative flex text-neutral-300">
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onCreateChat={onCreateChat}
        isNewChatPending={isNewChatPending}
      />

      <div
        className={`flex-shrink-0 bg-comet-900 transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? "w-0" : "w-78"
        }`}
      >
        <div className="h-full flex flex-col">
          <NewChatButton onCreateChat={onCreateChat} />

          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <ChatList
                chats={chats}
                activeChatId={activeChatId}
                searchQuery={searchQuery}
                pinnedChatIds={pinnedChatIds}
                onSelectChat={onSelectChat}
                onPinToggle={handlePinToggle}
                onDeleteClick={handleDeleteClick}
              />
            </div>
          </div>

          <div className="p-2">
            {session?.user ? (
              <UserAccount user={session.user} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        chatId={showDeleteConfirm}
        isOpen={!!showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
