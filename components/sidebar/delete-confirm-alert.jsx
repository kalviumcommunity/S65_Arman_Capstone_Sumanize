"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteConfirmAlert({
  chatId,
  isOpen,
  onConfirm,
  onCancel,
  onOpenChange,
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-neutral-800 border-neutral-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Delete Chat
          </AlertDialogTitle>
          <AlertDialogDescription className="text-neutral-300">
            Are you sure you want to delete this chat? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-neutral-600 text-white hover:bg-neutral-700 border-neutral-600"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(chatId)}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
