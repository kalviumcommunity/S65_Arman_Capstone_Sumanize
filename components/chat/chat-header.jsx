export function ChatHeader({ title, isNewChatPending }) {
  return (
    <header className="bg-neutral-800 p-4 border-b border-neutral-700">
      <h1 className="text-xl font-semibold">
        {isNewChatPending ? "New Chat" : title || "AI Chat"}
      </h1>
    </header>
  );
}
