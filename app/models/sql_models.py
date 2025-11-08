from sqlmodel import Field, SQLModel, Relationship, select, Session
import uuid
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import registry
import logging


class User_Base(SQLModel):
  name: str


class User(User_Base, table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  name: str = Field()
  email: str = Field(unique=True)
  password: bytes = Field()
  created_at: datetime = Field()


class ChatSessionBase(SQLModel):
  title: str
  created_at: datetime


class ChatSession(ChatSessionBase, table=True):
  __tablename__ = "chat_session"  # type: ignore
  id: Optional[int] = Field(default=None, primary_key=True)
  chat_message_history: list["ChatMessage"] = Relationship(
    back_populates="chat", cascade_delete=True
  )


class ChatMessageBase(SQLModel):
  sender_id: int
  message: str
  sent_at: datetime


class ChatMessage(ChatMessageBase, table=True):
  __tablename__ = "chat_message"  # type: ignore
  id: Optional[int] = Field(default=None, primary_key=True)
  chat_session_id: uuid.UUID | None = Field(default=None, foreign_key="chat_session.id")
  chat: ChatSession | None = Relationship(back_populates="chat_message_history")
  sender_id: int = Field(foreign_key="user.id")


class ChatMessageForm(SQLModel):
  sender_id: str
  message: str


# relationship table, which users belong to which chat sessions
class ChatSessionMembership(SQLModel, table=True):
  __tablename__ = "chat_session_membership"  # type: ignore
  id: Optional[int] = Field(default=None, primary_key=True)
  chat_session_id: int = Field(foreign_key="chat_session.id")
  user_id: int = Field(foreign_key="user.id")


class BrowserSession(SQLModel, table=True):
  __tablename__ = "browser_session"  # type: ignore
  id: Optional[int] = Field(default=None, primary_key=True, index=True)
  user_id: int = Field(foreign_key="user.id", nullable=False, index=True)
  created_at: datetime | None = Field(default=datetime.now(), nullable=False)
  expires_at: datetime | None = Field(
    default=datetime.now() + timedelta(hours=8), nullable=False
  )


def get_message_history(session):
  statement = select(ChatMessage)
  messages = session.exec(statement)
  return messages


def add_user(session: Session, new_user: User) -> bool:
  try:
    session.add(new_user)
    session.commit()
    return True
  except Exception as e:
    logging.error(e)
    return False


def get_user(session: Session, email: str) -> User | None:
  try:
    statement = select(User).where(User.email == email)
    results = session.exec(statement)
    user = results.first()
    return user
  except Exception as e:
    logging.error(e)
    return None
