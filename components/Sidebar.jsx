"use client";

import { useSession } from "next-auth/react";
import UserAccountNav from "./UserAccountNav";

export default function Sidebar({ chats = [], activeChatId, onCreateChat, onSelectChat }) {
  const { data: session } = useSession();

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
              <p className="text-xs mt-1">Create your first chat to get started</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.chatId}
                  onClick={() => onSelectChat(chat.chatId)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                    chat.chatId === activeChatId
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <div className="font-medium text-sm truncate">
                    {chat.title}
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Account Navigation */}
      {session?.user && (
        <div className="border-t border-neutral-700 p-4">
          <UserAccountNav user={session.user} />
        </div>
      )}
    </div>
  );
} 