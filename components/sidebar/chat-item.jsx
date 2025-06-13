import { PushPin, PushPinSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ChatItem({
  chat,
  activeChatId,
  onSelectChat,
  onPinToggle,
  onDeleteClick,
}) {
  return (
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
              <PushPin size={12} className="text-blue-400 flex-shrink-0" />
            )}
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

      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onPinToggle(chat.chatId, chat.isPinned);
          }}
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-1 bg-neutral-800 hover:bg-neutral-700 transition-colors"
        >
          {chat.isPinned ? (
            <PushPinSlash size={12} className="text-blue-400" />
          ) : (
            <PushPin
              size={12}
              className="text-neutral-400 hover:text-blue-400"
            />
          )}
        </Button>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(chat.chatId);
          }}
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-1 bg-neutral-800 hover:bg-red-800 transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className="text-neutral-400 hover:text-red-400 transition-colors"
          >
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
