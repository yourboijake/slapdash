from pydantic import BaseModel
from sqlmodel import Field, Session, SQLModel, create_engine, select, Relationship
from fastapi import Depends, FastAPI, HTTPException, Query
import uuid
from datetime import datetime

# user base class and table
class UserBase(SQLModel):
  name: str

class User(UserBase, table=True):
  id: uuid.UUID = Field(default=None, primary_key=True)
  name: str = Field()

# chat base class and table
class ChatSessionBase(SQLModel):
  title: str
  created_at: datetime

# chat messages attribute show all messages in chat histoyr for a specific chat
class ChatSession(ChatSessionBase, table=True):
  id: uuid.UUID = Field(default=None, primary_key=True)
  chat_message_history: list["ChatMessage"] = Relationship(back_populates="chat", cascade_delete=True)

class ChatMessageBase(SQLModel):
  sender_id: uuid.UUID
  message: str
  sent_at: datetime

class ChatMessage(ChatMessageBase, table=True):
  id: int | None = Field(default=None, primary_key=True)
  chat_id: uuid.UUID = Field(default=None, foreign_key="chatsession.id")
  chat: ChatSession = Relationship(back_populates="chat_message_history")
  sender_id: uuid.UUID = Field(foreign_key="user.id")

# relationship table, which users belong to which chat sessions
class ChatMembership(SQLModel, table=True):
  id: uuid.UUID = Field(default=None, primary_key=True)
  chat_id: uuid.UUID = Field(foreign_key="chatsession.id")
  user_id: uuid.UUID = Field(foreign_key="user.id")



def create_db_and_tables(engine):
  SQLModel.metadata.create_all(engine)