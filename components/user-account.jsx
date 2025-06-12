"use client";

import { signOut } from "next-auth/react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function UserAccountNav({ user }) {
  const firstLetter =
    user && user.name && typeof user.name === "string"
      ? user.name.charAt(0).toUpperCase()
      : "?";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 w-full rounded-lg p-4 hover:bg-neutral-800/50 transition-colors focus:outline-none cursor-pointer"
          title="Account"
        >
          <Avatar className="h-10 w-10 border-2 border-neutral-800">
            <AvatarFallback className="bg-neutral-900">
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm text-left">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-neutral-400">{user.email}</span>
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => signOut()}
          className="text-red-600 focus:bg-red-50"
        >
          Sign Out
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
