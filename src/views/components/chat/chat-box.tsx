import type { FC } from "hono/jsx";

type ChatBoxProps = {
  chatSessionId: number;
};

export const ChatBox: FC<ChatBoxProps> = ({ chatSessionId }) => {
  return (
    <div id="chat-box" class="w-full">
      <form
        id="form"
        ws-send
        hx-trigger="submit from:body"
        hx-target="#chat-history"
        hx-swap="beforeend scroll:#chat-history:bottom"
      >
        <input type="hidden" name="chat_session_id" value={chatSessionId} />
        <div class="relative w-full">
          <textarea
            name="message"
            rows={4}
            cols={20}
            class="textarea w-full focus:outline-none focus:ring-0 border-2 rounded-md"
            style="resize: none;"
          ></textarea>
          <input
            type="submit"
            value="Send"
            class="btn btn-soft absolute bottom-3 right-2 px-4 py-2"
          />
        </div>
      </form>
    </div>
  );
};
