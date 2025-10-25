from sqlmodel import Field, SQLModel, Relationship, select, Session
import uuid
from datetime import datetime
from typing import Optional

class User_Base(SQLModel):
  name: str

class User(User_Base, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  name: str = Field()
  email: str = Field(unique=True)
  password: bytes = Field()
  created_at: datetime = Field()

class Chat_Session_Base(SQLModel):
  title: str
  created_at: datetime

class Chat_Session(Chat_Session_Base, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  chat_message_history: list["Chat_Message"] = Relationship(
    back_populates="chat", cascade_delete=True
  )

class Chat_Message_Base(SQLModel):
  sender_id: int
  message: str
  sent_at: datetime

class Chat_Message(Chat_Message_Base, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  chat_session_id: uuid.UUID | None = Field(
    default=None, foreign_key="chat_session.id"
  )
  chat: Chat_Session | None = Relationship(back_populates="chat_message_history")
  sender_id: int = Field(foreign_key="user.id")

class Chat_Message_Form(SQLModel):
  sender_id: str
  message: str

# relationship table, which users belong to which chat sessions
class Chat_Session_Membership(SQLModel, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  chat_session_id: int = Field(foreign_key="chat_session.id")
  user_id: int = Field(foreign_key="user.id")

def get_message_history(session):
  statement = select(Chat_Message)
  messages = session.exec(statement)
  return messages

def add_user(session: Session, new_user: User) -> None:
  session.add(new_user)
  session.commit()

def get_user(session: Session, email: str) -> User | None:
  statement = select(User).where(User.email == email)
  results = session.exec(statement)
  user = results.first()
  return user