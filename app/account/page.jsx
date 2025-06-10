"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push("/?auth=required");
  }, [session, status, router]);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionBadge = (tier, isPremium) => {
    if (isPremium) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        Free
      </span>
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const user = session.user;
  const usage = user.usage || {};
  const rateLimits = user.rateLimits || {};

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account</h1>
          <p className="text-neutral-400">
            Manage your account settings and subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Profile Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {user.image && (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {user.name}
                    </h3>
                    <p className="text-neutral-400">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-700">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300">
                      User ID
                    </label>
                    <p className="text-sm text-neutral-400 font-mono">
                      {user.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300">
                      Subscription
                    </label>
                    <div className="mt-1">
                      {getSubscriptionBadge(user.tier, user.isPremium)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-neutral-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Usage Statistics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-800 rounded p-4">
                  <div className="text-sm text-neutral-400">Messages Today</div>
                  <div className="text-2xl font-bold text-white">
                    {usage.messagesToday || 0}
                    <span className="text-sm text-neutral-400 ml-1">
                      / {rateLimits.messagesPerDay || 0}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((usage.messagesToday || 0) /
                            (rateLimits.messagesPerDay || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-neutral-800 rounded p-4">
                  <div className="text-sm text-neutral-400">
                    Documents Today
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {usage.documentsToday || 0}
                    <span className="text-sm text-neutral-400 ml-1">
                      / {rateLimits.documentsPerDay || 0}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((usage.documentsToday || 0) /
                            (rateLimits.documentsPerDay || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-neutral-800 rounded p-4">
                  <div className="text-sm text-neutral-400">
                    YouTube Videos Today
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {usage.youtubeVideosToday || 0}
                    <span className="text-sm text-neutral-400 ml-1">
                      / {rateLimits.youtubeVideosPerDay || 0}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          ((usage.youtubeVideosToday || 0) /
                            (rateLimits.youtubeVideosPerDay || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Subscription
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-300">
                    Current Plan
                  </label>
                  <div className="mt-1">
                    {getSubscriptionBadge(user.tier, user.isPremium)}
                  </div>
                </div>

                {user.subscriptionStatus && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300">
                      Status
                    </label>
                    <p className="text-sm text-neutral-400 capitalize">
                      {user.subscriptionStatus}
                    </p>
                  </div>
                )}

                {!user.isPremium && (
                  <div className="mt-4">
                    <Button
                      onClick={() => router.push("/premium")}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-neutral-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="w-full bg-transparent border-neutral-700 text-white hover:bg-neutral-800"
                >
                  Back to App
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/settings")}
                  className="w-full bg-transparent border-neutral-700 text-white hover:bg-neutral-800"
                >
                  Settings
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limit Information */}
        <div className="mt-8 bg-neutral-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Rate Limits</h2>

          {!user.isPremium && (
            <Alert className="mb-4">
              <AlertDescription>
                You're on the free plan with limited usage. Upgrade to Premium
                for unlimited access!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-300 mb-2">
                Messages per Day
              </h3>
              <p className="text-lg text-white">
                {rateLimits.messagesPerDay || 0}
              </p>
              <p className="text-xs text-neutral-500">
                Resets daily at midnight
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-300 mb-2">
                Documents per Day
              </h3>
              <p className="text-lg text-white">
                {rateLimits.documentsPerDay || 0}
              </p>
              <p className="text-xs text-neutral-500">
                Resets daily at midnight
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-300 mb-2">
                YouTube Videos per Day
              </h3>
              <p className="text-lg text-white">
                {rateLimits.youtubeVideosPerDay || 0}
              </p>
              <p className="text-xs text-neutral-500">
                Resets daily at midnight
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
