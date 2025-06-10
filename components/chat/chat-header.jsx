export default function ChatHeader({ currentChat }) {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-4">
      <h2 className="text-lg font-semibold text-white">
        {currentChat?.title || "Select a chat"}
      </h2>
    </div>
  );
} 