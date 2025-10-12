from fastapi import Request, HTTPException, Form, APIRouter, Depends, WebSocket
from fastapi.responses import HTMLResponse
from app.models.chat import ChatMessageForm, ChatMessage, get_message_history
from app.database import get_session
from typing import Annotated
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from sqlmodel import Session
import datetime
import uuid

templates = Jinja2Templates(directory="templates")
template_env = Environment(loader=FileSystemLoader("templates"))

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_session)]

class ConnectionManager:
  def __init__(self):
    self.active_connections: list[WebSocket] = []

  async def connect(self, websocket: WebSocket):
    await websocket.accept()
    self.active_connections.append(websocket)

  def disconnect(self, websocket: WebSocket):
    self.active_connections.remove(websocket)

  async def send_personal_message(self, message: str, websocket: WebSocket):
    await websocket.send_text(message)

  async def broadcast(self, message: str):
    for connection in self.active_connections:
      await connection.send_text(message)

manager = ConnectionManager()

@router.get('/', response_class=HTMLResponse)
async def home(request: Request, session: SessionDep) -> HTMLResponse:
  chat_history = [msg for msg in get_message_history(session)]
  page = templates.TemplateResponse("chat_home.jinja", {'request': request, 'chat_history': chat_history})
  return page

@router.post('/send-chat', response_class=HTMLResponse)
async def send_chat(request: Request, chat_message_form: Annotated[ChatMessageForm, Form()], session: SessionDep) -> HTMLResponse:
  new_chat = ChatMessage(
    sender_id=uuid.UUID(chat_message_form.sender_id), 
    message=chat_message_form.message,
    sent_at=datetime.datetime.now(),
  )
  session.add(new_chat)
  session.commit()
  session.refresh(new_chat)
  ChatHistoryRow = template_env.get_template("chat.jinja").module.ChatHistoryRow # type: ignore
  new_chat_html = ChatHistoryRow(new_chat)
  return HTMLResponse(content=new_chat_html)

def parse_websocket_json(data: dict) -> ChatMessage | None:
  try:
    new_chat = ChatMessage(
      sender_id=uuid.UUID(data['sender_id']),
      message=data['message'],
      sent_at=datetime.datetime.now(),
    )
    return new_chat
  except:
    print('failed to create ChatMessage object from websocket data: ', data);
    return None

@router.websocket('/chat')
async def ws_endpoint(websocket: WebSocket, session: SessionDep):
  await manager.connect(websocket)
  try:
    while True:
      data = await websocket.receive_json()
      new_chat = parse_websocket_json(data)
      if new_chat != None:
        session.add(new_chat)
        session.commit()
        session.refresh(new_chat)
        ChatHistoryRowOOBSwap = template_env.get_template("chat.jinja").module.ChatHistoryRowOOBSwap # type: ignore
        new_chat_html = ChatHistoryRowOOBSwap(new_chat)
        await manager.broadcast(new_chat_html)
  except:
    manager.disconnect(websocket)