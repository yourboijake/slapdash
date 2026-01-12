import type { FC } from "hono/jsx";
import { getAllUsers } from "../../../models/services/user.service";

type ChatSidebarProps = {
  userId: number;
};

export const ChatSidebar: FC<ChatSidebarProps> = async ({ userId }) => {
  const allUsers = await getAllUsers();
  const otherUserNames = allUsers
    .filter((user) => user.id !== userId)
    .map((user) => user.name);
  return <div>{otherUserNames.join(", ")}</div>;
};
