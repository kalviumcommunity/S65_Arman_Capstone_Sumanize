import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function UserProfile({ session, onSignIn }) {
  const isAuthenticated = !!session;

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium text-white">
              {session.user.name}
            </p>
            <p className="text-xs text-neutral-400">{session.user.email}</p>
          </div>
        </div>
        <Button
          onClick={() => signOut()}
          variant="ghost"
          size="sm"
          className="text-neutral-400 hover:text-red-400"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-neutral-400 mb-2">
        Sign in to save your chats and get more messages
      </p>
      <Button
        onClick={onSignIn}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Sign In
      </Button>
    </div>
  );
}
