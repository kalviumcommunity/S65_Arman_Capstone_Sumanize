"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Shield } from "@phosphor-icons/react";

export function ProfileSection({ user, usage }) {
  const firstLetter =
    user && user.name && typeof user.name === "string"
      ? user.name.charAt(0).toUpperCase()
      : "?";

  const getTierColor = (tier) => {
    switch (tier) {
      case "premium":
        return "bg-gradient-to-r from-yellow-500 to-amber-500";
      case "free":
        return "bg-gradient-to-r from-blue-500 to-indigo-500";
      case "unauthenticated":
        return "bg-gradient-to-r from-gray-500 to-slate-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500";
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case "premium":
        return "Premium";
      case "free":
        return "Free";
      case "unauthenticated":
        return "Guest";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-comet-900/60 to-comet-800/40 border-comet-700 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-comet-700 shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-comet-600 to-comet-700 text-comet-100 text-2xl font-bold">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Shield size={24} className="text-comet-400" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-comet-100">
                {user.name}
              </div>
              <div className="text-comet-400 flex items-center gap-2">
                <User size={16} />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-comet-500">
                <Calendar size={14} />
                Member since {new Date().toLocaleDateString()}
              </div>
            </div>
          </CardTitle>
          {usage && (
            <Badge
              variant="secondary"
              className={`text-sm px-4 py-2 ${getTierColor(usage.tier)} text-white font-semibold shadow-lg`}
            >
              {getTierLabel(usage.tier)}
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
