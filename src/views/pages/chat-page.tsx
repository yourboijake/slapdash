import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { ChatSection } from "../components/chat/chat-section";
import { ChatSidebar } from "../components/chat/chat-sidebar";

type ChatPageProps = {
  chatSessionId: number;
};

export const ChatPage: FC<ChatPageProps> = ({ chatSessionId }) => {
  return (
    <Layout>
      <div class="grid grid-cols-5 gap-4">
        <div class="col-span-1">
          <ChatSidebar />
        </div>
        <div class="col-span-4">
          <ChatSection chatSessionId={chatSessionId} />
        </div>
      </div>
    </Layout>
  );
};
