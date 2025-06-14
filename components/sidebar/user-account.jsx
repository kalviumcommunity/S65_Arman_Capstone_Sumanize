"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOut, Sun, Warning } from "@phosphor-icons/react";

export default function UserAccount({ user }) {
  const { data: session } = useSession();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const firstLetter =
    user && user.name && typeof user.name === "string"
      ? user.name.charAt(0).toUpperCase()
      : "?";

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/user/usage");
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    
    const interval = setInterval(fetchUsage, 15000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    window.refreshUsageIndicator = () => {
      fetchUsage();
    };
    
    return () => {
      delete window.refreshUsageIndicator;
    };
  }, []);

  if (!usage || loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-neutral-800">
            <AvatarFallback className="bg-neutral-900">
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-neutral-400">{user.email}</span>
          </div>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-2">
            <div className="w-4 h-4 border-2 border-comet-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  const percentage = (usage.used / usage.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  const remaining = Math.max(0, usage.limit - usage.used);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium': return 'bg-yellow-500';
      case 'free': return 'bg-blue-500';
      case 'unauthenticated': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'premium': return 'Premium';
      case 'free': return 'Free';
      case 'unauthenticated': return 'Guest';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-4 space-y-3">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-3 w-full rounded-lg p-3 hover:bg-neutral-800/50 transition-colors focus:outline-none cursor-pointer"
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

      <Card className="bg-comet-900/50 border-comet-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-comet-100">
              Daily Usage
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getTierColor(usage.tier)} text-white`}
            >
              {getTierLabel(usage.tier)}
            </Badge>
          </div>
          <CardDescription className="text-xs text-comet-400">
            {usage.used}/{usage.limit} messages used
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Progress 
              value={percentage} 
              className="h-2"
              style={{
                '--progress-background': isAtLimit 
                  ? '#ef4444' 
                  : isNearLimit 
                    ? '#f59e0b' 
                    : '#10b981'
              }}
            />
            
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${
                remaining === 0 
                  ? "text-red-400" 
                  : remaining <= 1 
                    ? "text-yellow-400" 
                    : "text-green-400"
              }`}>
                {remaining} remaining
              </span>
              <span className="text-comet-500">
                {Math.round(percentage)}%
              </span>
            </div>

            {isAtLimit && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 rounded-md p-2">
                <Warning size={14} />
                <span>Daily limit reached</span>
              </div>
            )}
            
            {isNearLimit && !isAtLimit && (
              <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-950/30 rounded-md p-2">
                <Sun size={14} />
                <span>Approaching limit</span>
              </div>
            )}

            {usage.tier === 'free' && !isAtLimit && (
              <div className="text-xs text-comet-500 text-center pt-1">
                Upgrade to Premium for 50 messages/day
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => signOut()}
        variant="outline"
        size="sm"
        className="w-full text-red-400 border-red-800 hover:bg-red-950/30 hover:text-red-300"
      >
        <SignOut size={14} className="mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
