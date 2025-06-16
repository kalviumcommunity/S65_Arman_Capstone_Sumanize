"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  SignOut,
  TrashSimple,
  Shield,
  Warning,
  ArrowLeft,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export function AccountActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/user/delete", { method: "DELETE" });
      if (response.ok) {
        await signOut({ redirect: true });
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Actions */}
      <Card className="bg-gradient-to-br from-comet-900/60 to-comet-800/40 border-comet-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield size={24} className="text-comet-400" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full justify-start gap-3 bg-comet-800/30 border-comet-600 text-comet-100 hover:bg-comet-700/50 hover:border-comet-500 transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Back to Chat
          </Button>

          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full justify-start gap-3 bg-comet-800/30 border-comet-600 text-comet-100 hover:bg-comet-700/50 hover:border-comet-500 transition-all duration-200"
          >
            <SignOut size={18} />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gradient-to-br from-red-950/20 to-red-900/20 border-red-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-red-400">
            <Warning size={24} />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-950/30 rounded-lg border border-red-800/30">
              <h4 className="font-semibold text-red-300 mb-2">
                Delete Account
              </h4>
              <p className="text-sm text-red-200/80 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-900/80 hover:bg-red-800 text-white border-red-700 gap-3 transition-all duration-200"
                  >
                    <TrashSimple size={18} />
                    Delete Account Permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-comet-950 border-red-800/50 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                      <Warning size={24} />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-comet-300 space-y-2">
                      <p>
                        This action cannot be undone. This will permanently
                        delete your account and:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-comet-400 ml-4">
                        <li>Remove all your chat history</li>
                        <li>Delete all saved attachments</li>
                        <li>Revoke access to all features</li>
                        <li>Remove all your data from our servers</li>
                      </ul>
                      <p className="font-semibold text-red-300 mt-4">
                        Are you absolutely sure you want to continue?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-comet-800 text-comet-100 border-comet-700 hover:bg-comet-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-900 hover:bg-red-800 text-white border-red-700"
                    >
                      {isDeleting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Deleting...
                        </div>
                      ) : (
                        <>
                          <TrashSimple size={16} className="mr-2" />
                          Yes, Delete Account
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
