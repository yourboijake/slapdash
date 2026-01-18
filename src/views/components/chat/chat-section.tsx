import type { FC } from "hono/jsx";
import { ChatHeader } from "./chat-header";
import { ChatHistory } from "./chat-history";
import { ChatBox } from "./chat-box";

type ChatSectionProps = {
  chatSessionId: number;
  userId: number;
};

export const ChatSection: FC<ChatSectionProps> = ({
  chatSessionId,
  userId,
}) => {
  return (
    // h-dvh ensures it fits perfectly even on mobile/resized windows
    // overflow-hidden on the parent is the "safety belt" to stop page scroll
    <div
      hx-ext="ws"
      ws-connect="/chat-ws"
      className="h-dvh w-full overflow-hidden flex flex-col"
    >
      {/* Header: Fixed Height */}
      <header className="h-[50px] flex-none">
        <ChatHeader title={`Chat Session ${chatSessionId}`} />
      </header>

      {/* History: Takes all remaining space and scrolls internally */}
      <main className="flex-grow overflow-y-auto">
        <ChatHistory chatSessionId={chatSessionId} />
      </main>

      {/* Input: Fixed Height */}
      <footer className="h-[100px] flex-none mb-4">
        <ChatBox chatSessionId={chatSessionId} />
      </footer>
    </div>
  );
};
