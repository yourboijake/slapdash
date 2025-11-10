import type { FC } from "hono/jsx";

type ChatHeaderProps = {
  title: string;
};

export const ChatHeader: FC<ChatHeaderProps> = ({ title }) => {
  return <div class="text-xl">{title}</div>;
};
