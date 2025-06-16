"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Warning,
  Sun,
  CheckCircle,
  Clock,
  TrendUp,
} from "@phosphor-icons/react";

export function UsageStats({ usage, onUsageUpdate }) {
  if (!usage) return null;

  const percentage = (usage.used / usage.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  const remaining = Math.max(0, usage.limit - usage.used);

  const getStatusIcon = () => {
    if (isAtLimit) return <Warning size={20} className="text-red-400" />;
    if (isNearLimit) return <Sun size={20} className="text-yellow-400" />;
    return <CheckCircle size={20} className="text-green-400" />;
  };

  const getStatusColor = () => {
    if (isAtLimit) return "from-red-500/20 to-red-600/20 border-red-500/30";
    if (isNearLimit)
      return "from-yellow-500/20 to-orange-600/20 border-yellow-500/30";
    return "from-green-500/20 to-emerald-600/20 border-green-500/30";
  };

  const getProgressColor = () => {
    if (isAtLimit) return "#ef4444";
    if (isNearLimit) return "#f59e0b";
    return "#10b981";
  };

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <TrendUp size={24} className="text-comet-400" />
            <span>Usage (12h cycle)</span>
          </CardTitle>
          <Badge
            variant="secondary"
            className={`text-sm px-4 py-2 ${getTierColor(usage.tier)} text-white font-semibold shadow-lg`}
          >
            {getTierLabel(usage.tier)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Usage Display */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-comet-300 font-medium">Messages</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-comet-100">
                {usage.used}
                <span className="text-lg text-comet-400 font-normal">
                  /{usage.limit}
                </span>
              </div>
              <div className="text-sm text-comet-500">
                {remaining} remaining
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Progress
              value={percentage}
              className="h-3 bg-comet-800/50"
              style={{
                "--progress-background": getProgressColor(),
              }}
            />
            <div className="flex justify-between text-sm text-comet-400">
              <span>{Math.round(percentage)}% used</span>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Resets in 12h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        <div
          className={`rounded-xl p-4 bg-gradient-to-r ${getStatusColor()} border`}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-semibold text-comet-100">
                {isAtLimit
                  ? "Limit reached"
                  : isNearLimit
                    ? "Approaching limit"
                    : "Good to go!"}
              </p>
              <p className="text-sm text-comet-300">
                {isAtLimit
                  ? "You've used all available messages for this cycle"
                  : isNearLimit
                    ? `${remaining} messages remaining`
                    : `${remaining} messages available`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
