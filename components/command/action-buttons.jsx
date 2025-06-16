"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MagnifyingGlass,
  GearSix,
  Sparkle,
  Minus,
  HouseSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command/cmdk";

export function ActionButtons({
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
      // If no onCreateChat handler, navigate to main page
      if (onCreateChat) {
        onCreateChat();
      } else {
        router.push("/");
      }
    } else {
      // If no onSelectChat handler, navigate to main page
      if (onSelectChat) {
        onSelectChat(chatId);
      } else {
        router.push("/");
      }
    }
  };

  const handleAccountClick = () => {
    router.push("/account");
  };

  const handlePremiumClick = () => {
    router.push("/premium");
  };

  const handleChatClick = () => {
    router.push("/");
  };

  return (
    <>
      {/* Left side buttons */}
      <div className="absolute top-2 left-2 z-20 p-1 flex bg-comet-900 rounded-lg">
        <Button
          onClick={handleChatClick}
          size="icon"
          className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer shadow-none"
        >
          <HouseSimple size={20} weight="bold" className="text-comet-200" />
        </Button>

        <Button
          onClick={handleSearchClick}
          size="icon"
          className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer shadow-none"
        >
          <MagnifyingGlass size={20} weight="bold" className="text-comet-200" />
        </Button>

        <Button
          onClick={() => {
            if (onCreateChat) {
              onCreateChat();
            } else {
              router.push("/");
            }
          }}
          size="icon"
          className="bg-comet-900 hover:bg-comet-850 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
          disabled={isNewChatPending}
        >
          <Plus size={20} weight="bold" className="text-comet-200" />
        </Button>
      </div>

      {/* Right side buttons */}
      <div className="fixed top-2 right-2 z-20 p-1 flex bg-comet-900 rounded-lg">
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

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={handleCommandClose}
        onSelectChat={handleCommandSelect}
      />
    </>
  );
}
