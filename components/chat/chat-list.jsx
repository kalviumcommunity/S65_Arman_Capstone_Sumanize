"use client";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChatCircle, Trash } from "@phosphor-icons/react";

export default function ChatList({
  chats,
  currentChatId,
  onChatSelect,
  onChatDelete,
}) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-36 text-neutral-500">
        <ChatCircle weight="fill" className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No chats yet</p>
        <p className="text-sm opacity-75">Start a new conversation?</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <ContextMenu key={chat.id}>
          <ContextMenuTrigger>
            <div
              onClick={() => onChatSelect(chat.id)}
              className={`
                relative flex items-center justify-between
                px-2 py-2 rounded-md cursor-pointer transition-all duration-200
                ${
                  currentChatId === chat.id
                    ? "bg-neutral-800"
                    : "hover:bg-neutral-800/50"
                }
              `}
            >
              {/* Chat Icon and Title */}
              <div className="flex items-center flex-1 min-w-0">
                <div className="flex-1 min-w-0 relative">
                  <h3
                    className={`
                      text-sm transition-colors whitespace-nowrap overflow-hidden
                      ${currentChatId === chat.id ? "text-neutral-100" : "text-neutral-200"}
                    `}
                    title={chat.title}
                  >
                    {chat.title}
                  </h3>
                  {/* Fallback gradient for browsers that don't support mask */}
                  <div className="absolute inset-y-0 right-0 w-8 pointer-events-none" />
                </div>
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem
              onClick={() => onChatDelete(chat.id)}
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete chat
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  );
}
