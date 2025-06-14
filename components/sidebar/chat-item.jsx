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
          className={`w-full text-left justify-start p-2 h-auto cursor-pointer ${
            chat.chatId === activeChatId
              ? "bg-comet-900 hover:bg-comet-900 hover:text-comet-50"
              : "hover:bg-comet-900 hover:text-comet-50"
          }`}
        >
          <div className="w-full">
            <div className="text-sm truncate pr-16 flex items-center gap-2">
              {chat.isPinned && (
                <PushPin
                  size={12}
                  weight="bold"
                  className="text-comet-400 flex-shrink-0"
                />
              )}
              {chat.title}
              {chat.title === "New Chat" &&
                chat.chatId === activeChatId &&
                chat.messages?.length > 0 && (
                  <div className="flex space-x-1">
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

        {/* Shadow overlay that appears on hover */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-comet-950 via-comet-950/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Action buttons */}
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 p-1 bg-comet-900 rounded-lg shadow-lg z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="h-6 w-6 p-1 bg-transparent hover:bg-comet-800 transition-colors cursor-pointer"
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
                  <PushPin size={14} weight="bold" className="text-comet-400" />
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
                className="h-6 w-6 p-1 rounded-full bg-red-950 transition-colors cursor-pointer"
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
    </TooltipProvider>
  );
}
