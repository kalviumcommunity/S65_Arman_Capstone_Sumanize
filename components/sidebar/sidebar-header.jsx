"use client";
import { useState } from "react";
import {
  SidebarSimple,
  ArrowLineRight,
  ArrowLineLeft,
  Plus,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command/cmdk";

export function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
  onCreateChat,
  onSelectChat,
  isNewChatPending,
}) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const handleSearchClick = () => {
    setIsCommandOpen(true);
  };

  const handleCommandClose = () => {
    setIsCommandOpen(false);
  };

  const handleCommandSelect = (chatId) => {
    if (chatId === null) {
      onCreateChat?.();
    } else {
      onSelectChat?.(chatId);
    }
  };

  return (
    <>
      <div className="absolute top-2 left-2 z-20 p-1 flex bg-comet-900 rounded-lg">
        <Button
          onClick={onToggleCollapse}
          size="icon"
          className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer group shadow-none"
        >
          <span className="block group-hover:hidden">
            <SidebarSimple size={20} weight="bold" />
          </span>
          <span className="hidden group-hover:block">
            {isCollapsed ? (
              <ArrowLineRight
                size={20}
                weight="bold"
                className="animate-in zoom-in-50 duration-200 ease-out"
              />
            ) : (
              <ArrowLineLeft
                size={20}
                weight="bold"
                className="animate-in zoom-in-50 duration-200 ease-out"
              />
            )}
          </span>
        </Button>

        {isCollapsed && (
          <>
            <Button
              onClick={handleSearchClick}
              size="icon"
              className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer shadow-none"
            >
              <MagnifyingGlass size={20} weight="bold" />
            </Button>

            <Button
              onClick={onCreateChat}
              size="icon"
              className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isNewChatPending}
            >
              <Plus size={20} weight="bold" />
            </Button>
          </>
        )}
      </div>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={handleCommandClose}
        onSelectChat={handleCommandSelect}
      />
    </>
  );
}

export function NewChatButton({ onCreateChat }) {
  return (
    <div className="p-2 pt-15">
      <Button
        onClick={onCreateChat}
        className="w-full bg-comet-400 hover:bg-comet-500 text-comet-900 transition-colors duration-300 ease-in-out cursor-pointer"
      >
        New Chat
      </Button>
    </div>
  );
}
