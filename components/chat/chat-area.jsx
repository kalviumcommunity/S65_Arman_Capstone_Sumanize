import { useRef } from "react";
import MessageList from "./message-list";
import ChatInput from "./chat-input";

export default function ChatArea({
  currentChat,
  messages,
  loading,
  isAuthenticated,
  isLimitReached,
  onSendMessage,
  onSignIn,
}) {
  const scrollContainerRef = useRef(null);
  // if (!currentChat) {
  //   return (
  //     <div className="flex flex-1 flex-col h-full">
  //       <div className="flex-1 flex items-center justify-center">
  //         <div className="text-center text-neutral-400">
  //           <div className="text-6xl mb-4">💬</div>
  //           <h2 className="text-xl font-semibold mb-2">No Chat Selected</h2>
  //           <p className="text-neutral-500">
  //             Select a chat or start a new conversation
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Centered message list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <MessageList
            messages={messages}
            loading={loading}
            isAuthenticated={isAuthenticated}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>

      {/* Centered input area */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-4">
        <ChatInput
          onSendMessage={onSendMessage}
          loading={loading}
          isLimitReached={isLimitReached}
          isAuthenticated={isAuthenticated}
          onSignIn={onSignIn}
        />
      </div>
    </div>
  );
}
