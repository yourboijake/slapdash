import type { FC } from "hono/jsx";
import { getChatHistory } from "../../../models/services/chat.service";
import type { ChatMessageInsert } from "../../../models/types";

type ChatHistoryProps = {
  chatSessionId: number;
};

export const ChatHistory: FC<ChatHistoryProps> = async ({ chatSessionId }) => {
  const chatHistory = await getChatHistory(chatSessionId);
  return (
    <ul class="list w-full" id="chat-history">
      {chatHistory.map((chat) => {
        return <ChatHistoryRow chat={chat} />;
      })}
    </ul>
  );
};

const ChatHistoryRow: FC<{ chat: ChatMessageInsert }> = (props: {
  chat: ChatMessageInsert;
}) => {
  return (
    <li class="list-row hover:bg-info-content">
      <div class="size-10 rounded-box bg-primary"></div>
      <div>
        <div class="text-sm uppercase font-semibold opacity-60">
          {props.chat.createdAt}
        </div>
        <div class="list-col-wrap">{props.chat.content}</div>
      </div>
    </li>
  );
};
