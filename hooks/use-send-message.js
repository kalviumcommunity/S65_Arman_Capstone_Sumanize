import { useSession } from "next-auth/react";

export function useSendMessage({
  currentChatId,
  messages,
  addMessage,
  updateLastMessage,
  setErrorMessage,
  setLoading,
  incrementMessageCount,
  updateChatWithMessages,
}) {
  const { data: session } = useSession();

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !currentChatId) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setLoading(true);
    incrementMessageCount();

    const aiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    addMessage(aiMessage);

    try {
      let response;

      if (session) {
        response = await fetch("/api/chats/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: currentChatId,
            message: userMessage.content,
            history: messages,
          }),
        });
      } else {
        response = await fetch("/api/message/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userMessage.content,
            history: messages.map((m) => ({ role: m.role, text: m.content })),
          }),
        });
      }

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content || data.text) {
                const content = data.content || data.text;
                aiContent += content;
                updateLastMessage(aiContent);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      if (!session) {
        const finalUserMessage = { ...userMessage };
        const finalAiMessage = { ...aiMessage, content: aiContent };
        const updatedMessages = [...messages, finalUserMessage, finalAiMessage];
        updateChatWithMessages(currentChatId, updatedMessages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("Sorry, there was an error processing your message.");
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage };
}
