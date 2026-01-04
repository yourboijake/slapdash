import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { ChatHeader } from "../components/chat/chat-header";
import { ChatHistory } from "../components/chat/chat-history";
import { ChatBox } from "../components/chat/chat-box";

type ChatPageProps = {
  chatSessionId: number;
};

export const ChatPage: FC<ChatPageProps> = ({ chatSessionId }) => {
  return (
    <Layout>
      <div hx-ext="ws" ws-connect="/chat-ws">
        <div class="flex flex-col items-center justify-center h-screen">
          <div class="h-10 w-2/3 flex text-white">
            <ChatHeader title="test chat title" />
          </div>
          <div class="flex-1 overflow-y-auto min-h-0 w-2/3 bg-base-200 flex items-center justify-center text-white">
            <ChatHistory chatSessionId={chatSessionId} />
          </div>
          <div class="h-30 w-2/3 flex items-center justify-center text-white">
            <ChatBox />
          </div>
        </div>
      </div>
    </Layout>
  );
};
