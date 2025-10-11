from sqlmodel import Field, SQLModel, Relationship, select
import uuid
from datetime import datetime

# user base class and table
class UserBase(SQLModel):
  name: str

class User(UserBase, table=True):
  id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
  name: str = Field()

# chat base class and table
class ChatSessionBase(SQLModel):
  title: str
  created_at: datetime

# chat messages attribute show all messages in chat histoyr for a specific chat
class ChatSession(ChatSessionBase, table=True):
  id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
  chat_message_history: list["ChatMessage"] = Relationship(back_populates="chat", cascade_delete=True)

class ChatMessageBase(SQLModel):
  sender_id: uuid.UUID
  message: str
  sent_at: datetime

class ChatMessage(ChatMessageBase, table=True):
  id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
  chat_session_id: uuid.UUID | None = Field(default=None, foreign_key="chatsession.id")
  chat: ChatSession | None = Relationship(back_populates="chat_message_history")
  sender_id: uuid.UUID = Field(foreign_key="user.id")

class ChatMessageForm(SQLModel):
  sender_id: str
  message: str

# relationship table, which users belong to which chat sessions
class ChatMembership(SQLModel, table=True):
  id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
  chat_id: uuid.UUID = Field(foreign_key="chatsession.id")
  user_id: uuid.UUID = Field(foreign_key="user.id")


def get_message_history(session):
  statement = select(ChatMessage)
  messages = session.exec(statement)
  return messages