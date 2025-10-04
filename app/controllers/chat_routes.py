from fastapi import Request, HTTPException, Form, APIRouter
from fastapi.responses import HTMLResponse
from app.models.chat import ChatMessage
from typing import Annotated
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader

templates = Jinja2Templates(directory="templates")
template_env = Environment(loader=FileSystemLoader("templates"))

router = APIRouter()

@router.get('/', response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
  page = templates.TemplateResponse("chat_home.jinja", {'request': request})
  return page

@router.post('/send-chat', response_class=HTMLResponse)
async def send_chat(request: Request, chat_message: Annotated[ChatMessage, Form()]) -> HTMLResponse:
  new_html = f'<li>{chat_message.message}</li>'
  print(chat_message)
  return HTMLResponse(content=new_html)