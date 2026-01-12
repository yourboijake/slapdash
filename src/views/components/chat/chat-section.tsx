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
    <div hx-ext="ws" ws-connect="/chat-ws">
      <ChatHeader title="test chat title" />
      <ChatHistory chatSessionId={chatSessionId} />
      <ChatBox />
    </div>
  );
};
