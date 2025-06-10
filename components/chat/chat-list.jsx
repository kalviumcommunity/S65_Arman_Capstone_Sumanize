import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export default function ChatList({
  chats,
  currentChatId,
  onChatSelect,
  onChatDelete,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          className={`p-3 rounded-lg cursor-pointer mb-2 group ${
            currentChatId === chat.id
              ? "bg-neutral-800 border border-neutral-700"
              : "hover:bg-neutral-800"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">
                {chat.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {new Date(chat.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onChatDelete(chat.id);
              }}
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 p-1"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 