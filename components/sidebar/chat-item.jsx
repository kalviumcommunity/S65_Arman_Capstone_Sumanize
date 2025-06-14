"use client";

import { PushPin, PushPinSlash, Minus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChatItem({
  chat,
  activeChatId,
  onSelectChat,
  onPinToggle,
  onDeleteClick,
}) {
  return (
    <TooltipProvider>
      <div className="relative group">
        <Button
          onClick={() => onSelectChat(chat.chatId)}
          variant="ghost"
          className={`w-full text-left text-comet-100 hover:text-comet-50 justify-start p-2 h-auto cursor-pointer ${
            chat.chatId === activeChatId
              ? "bg-comet-800 hover:bg-comet-850"
              : "hover:bg-comet-850 hover:text-comet-50"
          }`}
        >
          <div className="w-full">
            <div
              className={`text-sm flex items-center gap-2 group-hover:pr-13`}
            >
              {chat.isPinned && (
                <PushPin
                  size={12}
                  weight="bold"
                  className="text-comet-400 flex-shrink-0"
                />
              )}
              <span className="truncate min-w-0">{chat.title}</span>
              {chat.title === "New Chat" &&
                chat.chatId === activeChatId &&
                chat.messages?.length > 0 && (
                  <div className="flex space-x-1 flex-shrink-0">
                    <div className="w-1 h-1 bg-comet-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-comet-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-comet-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                )}
            </div>
          </div>
        </Button>

        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-comet-950 via-comet-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="h-6 w-6 p-2 bg-comet-900 hover:bg-comet-800 transition-colors duration-300 cursor-pointer rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinToggle(chat.chatId, chat.isPinned);
                  }}
                >
                  {chat.isPinned ? (
                    <PushPinSlash
                      size={14}
                      weight="bold"
                      className="text-comet-400"
                    />
                  ) : (
                    <PushPin
                      size={14}
                      weight="bold"
                      className="text-comet-400"
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{chat.isPinned ? "Unpin chat" : "Pin chat"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="h-6 w-6 p-2 bg-red-950 hover:bg-red-900 transition-colors duration-300 cursor-pointer rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(chat.chatId);
                  }}
                >
                  <Minus size={14} weight="bold" className="text-red-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete chat</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
