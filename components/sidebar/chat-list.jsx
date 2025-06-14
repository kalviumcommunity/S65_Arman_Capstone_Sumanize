import { ChatItem } from "./chat-item";
import { SectionHeader } from "./section-header";

export function ChatList({
  chats,
  activeChatId,
  searchQuery,
  pinnedChatIds,
  onSelectChat,
  onPinToggle,
  onDeleteClick,
}) {
  const isToday = (date) => {
    const today = new Date();
    const chatDate = new Date(date);
    return (
      chatDate.getDate() === today.getDate() &&
      chatDate.getMonth() === today.getMonth() &&
      chatDate.getFullYear() === today.getFullYear()
    );
  };

  const chatsWithPinStatus = chats.map((chat) => ({
    ...chat,
    isPinned: pinnedChatIds.has(chat.chatId),
  }));

  const filteredChats = chatsWithPinStatus.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedChats = filteredChats.filter((chat) => chat.isPinned);
  const todayChats = filteredChats.filter(
    (chat) => !chat.isPinned && chat.createdAt && isToday(chat.createdAt),
  );
  const olderChats = filteredChats.filter(
    (chat) => !chat.isPinned && (!chat.createdAt || !isToday(chat.createdAt)),
  );

  return (
    <div className="space-y-4">
      {pinnedChats.length > 0 && (
        <div>
          <SectionHeader title="Pinned" count={pinnedChats.length} />
          <div className="space-y-1">
            {pinnedChats.map((chat) => (
              <ChatItem
                key={chat.chatId}
                chat={chat}
                activeChatId={activeChatId}
                onSelectChat={onSelectChat}
                onPinToggle={onPinToggle}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        </div>
      )}

      {todayChats.length > 0 && (
        <div>
          <SectionHeader title="Today" count={todayChats.length} />
          <div className="space-y-1">
            {todayChats.map((chat) => (
              <ChatItem
                key={chat.chatId}
                chat={chat}
                activeChatId={activeChatId}
                onSelectChat={onSelectChat}
                onPinToggle={onPinToggle}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        </div>
      )}

      {olderChats.length > 0 && (
        <div>
          <SectionHeader title="Older" count={olderChats.length} />
          <div className="space-y-1">
            {olderChats.map((chat) => (
              <ChatItem
                key={chat.chatId}
                chat={chat}
                activeChatId={activeChatId}
                onSelectChat={onSelectChat}
                onPinToggle={onPinToggle}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
