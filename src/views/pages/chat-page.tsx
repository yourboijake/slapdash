import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { ChatSection } from "../components/chat/chat-section";
import { ChatSidebar } from "../components/chat/chat-sidebar";

type ChatPageProps = {
  chatSessionId: number;
  userId: number;
};

export const ChatPage: FC<ChatPageProps> = ({ chatSessionId, userId }) => {
  return (
    <Layout>
      <div class="grid grid-cols-5 gap-4 h-full">
        <div class="col-span-1">
          <ChatSidebar userId={userId} />
        </div>
        <div class="col-span-4">
          <ChatSection chatSessionId={chatSessionId} userId={userId} />
        </div>
      </div>
    </Layout>
  );
};
