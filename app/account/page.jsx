"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Clock, Gear } from "@phosphor-icons/react";

// Account components
import { ProfileSection } from "@/components/account/profile-section";
import { UsageStats } from "@/components/account/usage-stats";
import { KeyboardShortcuts } from "@/components/account/keyboard-shortcuts";
import { AccountActions } from "@/components/account/account-actions";
import { HistoryAndAttachments } from "@/components/account/history-and-attachments";

// Auth components
import { LoadingScreen } from "@/components/auth/loading-screen";
import { ActionButtons } from "@/components/command/action-buttons";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
    if (status === "authenticated") {
      fetchUsage();
    } else if (status === "unauthenticated") {
      // Redirect unauthenticated users to main chat interface
      router.push("/");
      return;
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return <LoadingScreen />;
  }

  if (status === "unauthenticated") {
    // This should not be reached due to redirect above, but just in case
    return null;
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-comet-950 via-comet-900 to-comet-950">
      <ActionButtons />
      {/* Header */}
      <div className="bg-comet-950 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/")}
                size="sm"
                className="text-comet-400 hover:text-comet-200 hover:bg-comet-850"
              >
                <ArrowLeft size={20} weight="bold" className="mr-2" />
                Back to Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 bg-comet-900/50 border border-comet-800 rounded-2xl p-2 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-comet-700 data-[state=active]:text-comet-100 data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
            >
              <User size={18} className="mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-comet-700 data-[state=active]:text-comet-100 data-[state=active]:shadow-lg rounded-xl transition-all duration-200"
            >
              <Clock size={18} className="mr-2" />
              History & Attachments
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <ProfileSection user={user} usage={usage} />
                <UsageStats usage={usage} onUsageUpdate={fetchUsage} />
              </div>
              <div className="space-y-8">
                <KeyboardShortcuts />
                <AccountActions />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-8">
            <HistoryAndAttachments onUsageUpdate={fetchUsage} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
