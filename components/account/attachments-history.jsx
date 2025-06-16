"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Paperclip,
  FileText,
  Calendar,
  TrashSimple,
  Clock,
  Copy,
  Empty,
} from "@phosphor-icons/react";

export function AttachmentsHistory() {
  const [recentAttachments, setRecentAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentAttachments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/attachments?limit=12");
      if (response.ok) {
        const attachments = await response.json();
        setRecentAttachments(attachments);
      }
    } catch (error) {
      console.error("Failed to fetch recent attachments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllAttachments = async () => {
    try {
      const response = await fetch("/api/attachments", { method: "DELETE" });
      if (response.ok) {
        setRecentAttachments([]);
      }
    } catch (error) {
      console.error("Failed to delete all attachments:", error);
    }
  };

  const handleCopyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy content:", error);
    }
  };

  useEffect(() => {
    fetchRecentAttachments();
  }, []);

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} chars`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)}K chars`;
    return `${(size / 1048576).toFixed(1)}M chars`;
  };

  return (
    <Card className="bg-gradient-to-br from-comet-900/60 to-comet-800/40 border-comet-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <Paperclip size={24} className="text-comet-400" />
            <span>Attachments</span>
            <span className="text-sm font-normal text-comet-500">
              ({recentAttachments.length} items)
            </span>
          </CardTitle>
          {recentAttachments.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-800/50 hover:bg-red-950/30 hover:border-red-700 transition-all duration-200"
                >
                  <TrashSimple size={14} className="mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-comet-950 border-comet-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-400">
                    Clear All Attachments
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-comet-300">
                    This will permanently delete all your pasted content. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-comet-800 text-comet-100 border-comet-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllAttachments}
                    className="bg-red-900 hover:bg-red-800"
                  >
                    Delete All Attachments
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-comet-600 border-t-comet-300 rounded-full" />
          </div>
        ) : recentAttachments.length === 0 ? (
          <div className="text-center py-12">
            <Empty size={64} className="mx-auto mb-4 text-comet-600" />
            <h3 className="text-lg font-medium text-comet-300 mb-2">
              No Attachments
            </h3>
            <p className="text-comet-500">
              Paste content or upload files in chat to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3">
              {recentAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group p-4 bg-comet-800/30 hover:bg-comet-800/50 border border-comet-700/50 hover:border-comet-600 rounded-xl transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText
                          size={16}
                          className="text-comet-400 flex-shrink-0"
                        />
                        <h4 className="font-medium text-comet-100 truncate">
                          {attachment.title || "Pasted Content"}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-xs text-comet-400">
                        <div className="flex items-center gap-1">
                          <span>{formatFileSize(attachment.size)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(attachment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(attachment.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </div>

                      <div className="bg-comet-800/40 rounded-lg p-3 mb-3">
                        <p className="text-sm text-comet-300 line-clamp-3 font-mono">
                          {attachment.preview}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() =>
                        handleCopyContent(
                          attachment.content || attachment.preview,
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-comet-700/50 border-comet-600 text-comet-200 hover:bg-comet-600/50"
                    >
                      <Copy size={14} className="mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {recentAttachments.length >= 12 && (
              <div className="text-center pt-4 border-t border-comet-800">
                <p className="text-sm text-comet-500">
                  Showing recent 12 attachments. Older items may have been
                  automatically cleaned up.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
