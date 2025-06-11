export function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-neutral-700 text-white px-4 py-3 rounded-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
