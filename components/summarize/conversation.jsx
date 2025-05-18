"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import ChatDisplay from "@/components/summarize/ui-interface";
import ChatInputModal from "@/components/summarize/cmdk";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function Conversation({
  selectedIds,
  setSelectedIds,
  sidebarWidth,
}) {
  const { user } = useAuth();
  const { activeMessages, isLoading, submitQuery, deleteConversation } =
    useChat();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Delete" && selectedIds.length > 0) {
        e.preventDefault();
        setIsDeleteDialogOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds]);

  const handleSubmitText = async (text) => {
    try {
      if (!user) {
        await submitQuery("/api/summarize", { text }, false);
        toast.info("Sign up to save your conversations", {
          action: {
            label: "Sign Up",
            onClick: () =>
              document.dispatchEvent(
                new CustomEvent("open-auth-modal", {
                  detail: { tab: "register" },
                }),
              ),
          },
        });
      } else {
        await submitQuery("/api/summarize", { text }, true);
      }
    } catch (err) {
      toast.error("Failed to get summary: " + err.message);
    }
  };

  return (
    <>
      <main
        className="flex flex-col h-full bg-neutral-200 overflow-hidden relative"
        style={{ width: `calc(100% - ${sidebarWidth}px)` }}
      >
        <div className="flex-grow flex flex-col h-full bg-neutral-900">
          <ChatDisplay messages={activeMessages} />
        </div>
      </main>
      <ChatInputModal onSubmit={handleSubmitText} isLoading={isLoading} />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-neutral-900 border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">
              Delete {selectedIds.length} conversation
              {selectedIds.length > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-300">
              This will permanently delete the selected conversation
              {selectedIds.length > 1 ? "s" : ""}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none bg-neutral-800 hover:bg-neutral-800 hover:text-neutral-300 text-neutral-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-neutral-300 hover:bg-neutral-400 text-neutral-800"
              onClick={async () => {
                if (user) {
                  for (const id of selectedIds) {
                    await deleteConversation(id);
                  }
                  setSelectedIds([]);
                  setIsDeleteDialogOpen(false);
                  toast.success("Chats deleted from history");
                } else {
                  toast.info("Sign up to manage conversations");
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Delete Chat{selectedIds.length > 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
