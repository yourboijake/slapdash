import { FC } from "hono/jsx";
import { chatMessage } from "../../../models/schema";
import { getChatHistory } from "../../../models/services";

type ChatMessageType = typeof chatMessage.$inferSelect;

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

const ChatHistoryRow: FC<{ chat: ChatMessageType }> = (props: {
  chat: ChatMessageType;
}) => {
  return (
    <li class="list-row hover:bg-info-content">
      <div class="size-10 rounded-box bg-primary"></div>
      <div>
        <div class="text-sm uppercase font-semibold opacity-60">
          {props.chat.created_at}
        </div>
        <div class="list-col-wrap">{props.chat.content}</div>
      </div>
    </li>
  );
};
