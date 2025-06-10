import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export default function UserProfile({ session, onSignIn }) {
  const isAuthenticated = !!session;

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
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
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-neutral-700">
            <User className="w-4 h-4 text-neutral-400" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-white">Guest User</p>
          <p className="text-xs text-neutral-400">Sign in to get more chats</p>
        </div>
      </div>
      <Button
        onClick={onSignIn}
        variant="ghost"
        size="sm"
        className="text-neutral-400 hover:text-blue-400"
      >
        Sign In
      </Button>
    </div>
  );
}
