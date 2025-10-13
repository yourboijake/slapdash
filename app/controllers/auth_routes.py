from fastapi import Request, HTTPException, Form, APIRouter, Depends, WebSocket
from fastapi.responses import HTMLResponse
from sqlmodel import Session
from typing import Annotated
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from app.database import get_session

templates = Jinja2Templates(directory="templates")
template_env = Environment(loader=FileSystemLoader("templates"))

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_session)]

@router.get('/sign-in', response_class=HTMLResponse)
async def sign_in_get(request: Request):
  print('hit sign in endpoint with get')
  page = templates.TemplateResponse("sign_in.jinja", {'request': request})
  return page

@router.post('/sign-in', response_class=HTMLResponse)
async def sign_in_post(username: Annotated[str, Form()], password: Annotated[str, Form()]):
  print(username, password)
  pass


@router.get('/sign-up', response_class=HTMLResponse)
async def sign_up(request: Request):
  print('sign up')
  page = templates.TemplateResponse("sign_up.jinja", {'request': request})
  return page

