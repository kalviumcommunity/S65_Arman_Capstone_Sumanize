import {
  SidebarSimple,
  ArrowLineRight,
  ArrowLineLeft,
  Plus,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
  onCreateChat,
  isNewChatPending,
}) {
  return (
    <div className="absolute top-2 left-2 z-20 flex bg-comet-850 rounded-lg p-1">
      <Button
        onClick={onToggleCollapse}
        size="icon"
        className="bg-comet-850 hover:bg-comet-900 cursor-pointer group"
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

      {isCollapsed && (
        <>
          <Button
            onClick={() => {
              /* TODO: Add search functionality */
            }}
            size="icon"
            className="bg-comet-850 hover:bg-comet-900 cursor-pointer"
            title="Search"
          >
            <MagnifyingGlass size={20} />
          </Button>

          <Button
            onClick={onCreateChat}
            size="icon"
            className="bg-comet-850 hover:bg-comet-900 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={isNewChatPending ? "New Chat Already Open" : "New Chat"}
            disabled={isNewChatPending}
          >
            <Plus size={20} />
          </Button>
        </>
      )}
    </div>
  );
}

export function NewChatButton({ onCreateChat }) {
  return (
    <div className="p-2 pt-15">
      <Button
        onClick={onCreateChat}
        className="w-full bg-comet-300 hover:bg-comet-500 text-comet-900 transition-all duration-300 ease-in-out cursor-pointer"
      >
        New Chat
      </Button>
    </div>
  );
}
