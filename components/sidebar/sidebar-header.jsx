"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarSimple,
  ArrowLineRight,
  ArrowLineLeft,
  Plus,
  MagnifyingGlass,
  GearSix,
  Sparkle,
  Minus,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command/cmdk";

export function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
  onCreateChat,
  onSelectChat,
  isNewChatPending,
  isPastedContentOpen = false,
  onClosePastedContent,
}) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const router = useRouter();

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

  const handleAccountClick = () => {
    router.push("/account");
  };

  const handlePremiumClick = () => {
    router.push("/premium");
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
            <SidebarSimple size={20} weight="bold" className="text-comet-200" />
          </span>
          <span className="hidden group-hover:block">
            {isCollapsed ? (
              <ArrowLineRight
                size={20}
                weight="bold"
                className="animate-in zoom-in-50 duration-300 text-comet-200 ease-out"
              />
            ) : (
              <ArrowLineLeft
                size={20}
                weight="bold"
                className="animate-in zoom-in-50 duration-300 text-comet-200 ease-out"
              />
            )}
          </span>
        </Button>

        {isCollapsed && (
          <div className="flex animate-in zoom-in-50 duration-300 ease-out">
            <Button
              onClick={handleSearchClick}
              size="icon"
              className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer shadow-none"
            >
              <MagnifyingGlass
                size={20}
                weight="bold"
                className="text-comet-200"
              />
            </Button>

            <Button
              onClick={onCreateChat}
              size="icon"
              className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
              disabled={isNewChatPending}
            >
              <Plus size={20} weight="bold" className="text-comet-200" />
            </Button>
          </div>
        )}
      </div>

      {isCollapsed && (
        <div className="fixed top-2 right-2 z-20 p-1 flex bg-comet-900 rounded-lg animate-in zoom-in-50 duration-300 ease-out">
          {isPastedContentOpen && onClosePastedContent && (
            <Button
              size="icon"
              onClick={onClosePastedContent}
              className="bg-red-950 hover:bg-red-900 transition-colors duration-300 cursor-pointer shadow-none"
            >
              <Minus size={20} weight="bold" className="text-red-400" />
            </Button>
          )}

          <Button
            size="icon"
            onClick={handleAccountClick}
            className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer shadow-none"
          >
            <GearSix size={20} weight="bold" className="text-comet-200" />
          </Button>

          <Button
            size="icon"
            onClick={handlePremiumClick}
            className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer shadow-none"
          >
            <Sparkle size={20} weight="bold" className="text-comet-200" />
          </Button>
        </div>
      )}

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
