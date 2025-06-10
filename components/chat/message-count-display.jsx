export default function MessageCountDisplay({
  messageCount,
  limit,
  isLimitReached,
  isAuthenticated,
}) {
  return (
    <div className="p-4 border-b border-neutral-800">
      <div className="text-center">
        <div className="text-sm text-neutral-400">
          {isAuthenticated ? "Authenticated User" : "Guest User"}
        </div>
        <div
          className={`text-lg font-medium ${isLimitReached ? "text-red-400" : "text-white"}`}
        >
          {messageCount} / {limit === Infinity ? "∞" : limit} messages
        </div>
        {isLimitReached && (
          <div className="text-xs text-red-400 mt-1">
            {isAuthenticated
              ? "Upgrade to Premium for unlimited messages"
              : "Sign in for more messages"}
          </div>
        )}
      </div>
    </div>
  );
}
