import { CursorClick } from "@phosphor-icons/react";

export function EmptyState({ isNewChatPending }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="flex justify-center">
          <CursorClick size={48} />
        </div>
        <h2 className="text-6xl font-serif mb-2">Sumanize</h2>
        <p className="w-2/3 mx-auto mb-2 text-neutral-500">
          Transform complex documents and datasets into clear, actionable
          insights. Start by typing your message below.
        </p>
      </div>
    </div>
  );
}
