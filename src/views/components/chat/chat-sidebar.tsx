import type { FC } from "hono/jsx";
import { getAllUsers } from "../../../models/services/user.service";
import type { user } from "../../../models/schema";

type ChatSidebarProps = {
  userId: number;
};
type ChatSidebarUserProps = {
  user: typeof user.$inferSelect;
};

export const ChatSidebar: FC<ChatSidebarProps> = async ({ userId }) => {
  const allUsers = await getAllUsers();
  const otherUsers = allUsers.filter((user) => user.id !== userId);
  return (
    <div>
      <div className="font-semibold">Direct Messages</div>
      <ul className="list">
        {otherUsers.map((u) => (
          <li className="list-row hover:bg-neutral p-2 rounded-md cursor-pointer">
            <ChatSidebarUser user={u} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ChatSidebarUser: FC<ChatSidebarUserProps> = ({ user }) => {
  const initials = user.name
    .split(" ")
    .map((n) => (n.length > 0 ? n[0] : ""))
    .join("")
    .toUpperCase();
  return (
    <>
      {initials} - {user.name}
    </>
  );
};
