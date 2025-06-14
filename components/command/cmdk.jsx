"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "cmdk";
import { MagnifyingGlass, Plus, Timer } from "@phosphor-icons/react";

export function CommandPalette({ isOpen, onClose, onSelectChat }) {
  const [recentChats, setRecentChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRecentChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/chats");
      if (response.ok) {
        const chats = await response.json();
        setRecentChats(chats.slice(0, 8));
      }
    } catch (error) {
      console.error("Failed to fetch recent chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRecentChats();
    }
  }, [isOpen, fetchRecentChats]);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  const handleSelectChat = (chatId) => {
    onSelectChat?.(chatId);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !recentChats.some((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Close command palette"
        />

        <div className="relative w-full max-w-lg mx-4">
          <Command
            shouldFilter={false}
            className="bg-comet-950 border border-comet-800 rounded-xl shadow-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center px-4 py-3 border-b border-comet-850">
              <div className="flex items-center text-comet-400 mr-3 flex-shrink-0">
                <MagnifyingGlass size={18} weight="bold" />
                <span className="mx-2 text-comet-700 text-sm font-medium">
                  /
                </span>
                <Plus size={18} weight="bold" />
              </div>
              <CommandInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1 bg-transparent text-sm text-comet-100 outline-none border-none focus:ring-0"
                autoFocus
              />
            </div>

            <CommandList className="h-92 overflow-y-auto py-2">
              <CommandEmpty className="px-6 py-8 text-center">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin h-4 w-4 border-2 border-comet-500 border-t-comet-300 rounded-full" />
                    <span className="text-sm text-comet-400">
                      Loading recent chats...
                    </span>
                  </div>
                ) : searchQuery ? (
                  <div className="space-y-3">
                    <div className="text-sm text-comet-300">
                      No chats found matching{" "}
                      <span className="text-comet-100 font-medium">
                        "{searchQuery}"
                      </span>
                    </div>
                    <div className="text-xs text-comet-500 bg-comet-900 rounded-lg px-3 py-2 inline-block">
                      Press{" "}
                      <kbd className="bg-comet-800 text-comet-300 px-1.5 py-0.5 rounded text-xs font-mono">
                        Enter
                      </kbd>{" "}
                      to start a new chat
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-comet-400">
                    No recent chats found
                  </div>
                )}
              </CommandEmpty>

              {recentChats.length > 0 && (
                <CommandGroup className="px-2 pb-2">
                  <div className="flex items-center gap-2 px-4 py-2 mb-2">
                    <Timer size={16} weight="bold" className="text-comet-400" />
                    <span className="text-xs font-semibold text-comet-400 uppercase tracking-wide">
                      Recent Chats
                    </span>
                  </div>

                  <div className="space-y-0.5 px-2">
                    {recentChats
                      .filter(
                        (chat) =>
                          !searchQuery ||
                          chat.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map((chat) => (
                        <CommandItem
                          key={chat.chatId}
                          value={chat.title}
                          onSelect={() => handleSelectChat(chat.chatId)}
                          className="flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-comet-850 active:bg-comet-800 rounded-md transition-all duration-150 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-comet-200 group-hover:text-comet-100 transition-colors truncate">
                              {chat.title}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </div>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      </div>
    </div>
  );
}
