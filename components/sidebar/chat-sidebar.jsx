"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import UserAccountNav from "../user-account";

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

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation(); // Prevent chat selection
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

  return (
    <div className="flex h-full flex-col bg-neutral-900">
      {/* Header with New Chat button */}
      <div className="p-4 border-b border-neutral-700">
        <button
          onClick={onCreateChat}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {chats.length === 0 ? (
            <div className="text-center text-neutral-500 py-8">
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">
                Create your first chat to get started
              </p>
            </div>
          ) : chats.length > 0 ? (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div key={chat.chatId} className="relative group">
                  <button
                    onClick={() => onSelectChat(chat.chatId)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      chat.chatId === activeChatId
                        ? "bg-neutral-700 text-white"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-sm truncate pr-8 flex items-center gap-2">
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
                    <div className="text-xs text-neutral-500 mt-1">
                      {chat.messages?.length || 0} messages
                    </div>
                    {chat.updatedAt && (
                      <div className="text-xs text-neutral-600 mt-1">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </button>

                  {/* Delete button - only show on hover */}
                  <button
                    onClick={(e) => handleDeleteClick(e, chat.chatId)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded p-1 text-xs"
                    title="Delete chat"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* User Account Navigation */}
      <div className="border-t border-neutral-700 p-4">
        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <button
            onClick={() => signIn("github")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In with GitHub
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
