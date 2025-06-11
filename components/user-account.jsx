"use client";

import { signOut } from "next-auth/react";

export default function UserAccountNav({ user }) {
  return (
    <div className="flex items-center gap-4">
      {user.image && (
        <img
          src={user.image}
          alt={user.name}
          className="h-8 w-8 rounded-full"
        />
      )}
      <div className="flex flex-col text-sm">
        <span className="font-medium">{user.name}</span>
        <span className="text-xs text-neutral-400">{user.email}</span>
      </div>
      <button
        onClick={() => signOut()}
        className="ml-auto rounded-md bg-neutral-700 px-3 py-1 text-sm text-white hover:bg-neutral-600"
      >
        Sign Out
      </button>
    </div>
  );
}
