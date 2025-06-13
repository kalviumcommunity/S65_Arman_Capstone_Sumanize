import { Button } from "@/components/ui/button";

export function DeleteConfirmDialog({ chatId, isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-white mb-2">Delete Chat</h3>
        <p className="text-neutral-300 mb-4">
          Are you sure you want to delete this chat? This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="bg-neutral-600 text-white hover:bg-neutral-700"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(chatId)}
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
