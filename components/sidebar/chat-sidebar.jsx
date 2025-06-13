"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import {
  MagnifyingGlass,
  SidebarSimple,
  ArrowLineRight,
  ArrowLineLeft,
  GithubLogo,
  GoogleLogo,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDeleteClick = (chatId) => {
    setShowDeleteConfirm(chatId);
  };

  const confirmDelete = async (chatId) => {
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

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <TooltipProvider>
      <div className="relative flex text-neutral-300">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleCollapse}
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 z-20 bg-neutral-900 hover:bg-neutral-800 transition-colors group"
            >
              <span className="block group-hover:hidden">
                <SidebarSimple size={20} />
              </span>
              <span className="hidden group-hover:block">
                {isCollapsed ? (
                  <ArrowLineRight size={20} />
                ) : (
                  <ArrowLineLeft size={20} />
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCollapsed ? "Show sidebar" : "Hide sidebar"}</p>
          </TooltipContent>
        </Tooltip>

        <div
          className={`flex-shrink-0 bg-neutral-900/50 transition-all duration-300 ease-in-out overflow-hidden ${
            isCollapsed ? "w-0" : "w-78"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-2 pt-13">
              <Button
                onClick={onCreateChat}
                className="w-full bg-neutral-300 hover:bg-neutral-400 text-neutral-900 transition-all duration-300 ease-in-out"
              >
                New Chat
              </Button>
            </div>

            <div className="px-2 pb-2">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 border-none focus:ring-0 text-neutral-500 placeholder:text-neutral-500 focus:o"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {filteredChats.length === 0 ? (
                  <div className="text-center text-neutral-500 p-2">
                    {chats.length === 0 ? (
                      <>
                        <p className="text-sm"></p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm">No chats found</p>
                        <p className="text-xs mt-1">
                          Try adjusting your search
                        </p>
                      </>
                    )}
                  </div>
                ) : filteredChats.length > 0 ? (
                  <div className="space-y-1">
                    {filteredChats.map((chat) => (
                      <ContextMenu key={chat.chatId}>
                        <ContextMenuTrigger asChild>
                          <div className="relative group">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => onSelectChat(chat.chatId)}
                                  variant="ghost"
                                  className={`w-full text-left justify-start p-2 h-auto ${
                                    chat.chatId === activeChatId
                                      ? "bg-neutral-950 hover:bg-neutral-950 hover:text-neutral-300"
                                      : "hover:bg-neutral-900/50 hover:text-neutral-300"
                                  }`}
                                >
                                  <div className="w-full">
                                    <div className="text-sm truncate pr-8 flex items-center gap-2">
                                      {chat.title}
                                      {chat.title === "New Chat" &&
                                        chat.chatId === activeChatId &&
                                        chat.messages?.length > 0 && (
                                          <div className="flex space-x-1">
                                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                                            <div
                                              className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                                              style={{ animationDelay: "0.1s" }}
                                            ></div>
                                            <div
                                              className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                                              style={{ animationDelay: "0.2s" }}
                                            ></div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Right click to delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => handleDeleteClick(chat.chatId)}
                            className="text-red-400 focus:text-red-400 focus:bg-red-950"
                          >
                            Delete Chat
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="p-2">
              {session?.user ? (
                <UserAccount user={session.user} />
              ) : (
                <div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => signIn("google")}
                      variant="ghost"
                      size="icon"
                      className="flex-1 bg-neutral-800/50 hover:bg-neutral-800/70 p-4 h-auto"
                      aria-label="Sign in with Google"
                    >
                      <GoogleLogo
                        size={16}
                        weight="bold"
                        className="text-neutral-100"
                      />
                    </Button>
                    <Button
                      onClick={() => signIn("github")}
                      variant="ghost"
                      size="icon"
                      className="flex-1 bg-neutral-800/50 hover:bg-neutral-800/70 p-4 h-auto"
                      aria-label="Sign in with GitHub"
                    >
                      <GithubLogo
                        size={16}
                        weight="bold"
                        className="text-neutral-100"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Delete Chat
              </h3>
              <p className="text-neutral-300 mb-4">
                Are you sure you want to delete this chat? This action cannot be
                undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={cancelDelete}
                  variant="ghost"
                  className="bg-neutral-600 text-white hover:bg-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  variant="destructive"
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
