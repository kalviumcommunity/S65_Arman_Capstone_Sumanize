"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserAccount({ user }) {
  const { data: session } = useSession();
  const router = useRouter();
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

  const handleAccountClick = () => {
    router.push("/account");
  };

  if (!usage || loading) {
    return (
      <div className="p-2">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-comet-900">
            <AvatarFallback className="bg-comet-900">
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-comet-400">{user.email}</span>
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

  return (
    <div className="p-2">
      <Button
        onClick={handleAccountClick}
        className="flex items-center justify-start gap-3 w-full rounded-xl p-4 bg-comet-900 hover:bg-comet-850 transition-colors focus:outline-none cursor-pointer shadow-none"
        title="Open Account Settings"
        size="md"
      >
        <Avatar className="h-10 w-10 rounded-lg border-2 border-comet-600">
          <AvatarFallback className="bg-comet-400 rounded-md text-comet-900">
            {firstLetter}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-sm text-left">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-comet-400">{user.email}</span>
        </div>
      </Button>
    </div>
  );
}
