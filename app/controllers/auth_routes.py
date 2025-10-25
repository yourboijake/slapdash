from fastapi import Request, HTTPException, Form, APIRouter, Depends, WebSocket
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlmodel import Session
from typing import Annotated
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from app.database import get_session, encrypt_password, check_encrypted_password
from app.models.sql_models import User, add_user, get_user
from datetime import datetime

templates = Jinja2Templates(directory="templates")
template_env = Environment(loader=FileSystemLoader("templates"))

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/sign-in", response_class=HTMLResponse)
async def sign_in():
  auth_page_template = template_env.get_template("auth_page.jinja").module.AuthPage # type: ignore
  page = auth_page_template('sign-in')
  return page

@router.post("/sign-in", response_class=HTMLResponse)
async def sign_in_post(
  session: SessionDep,
  email: Annotated[str, Form()], 
  password: Annotated[str, Form()]
  ):
  try:
    user = get_user(session, email)
    assert user != None
    email_check = check_encrypted_password(password, user.password)
    assert email_check == True
    return RedirectResponse(url="/", status_code=302)
  except Exception as e:
    print('exception: ', e)
    return 'failed to sign in'

@router.get("/sign-up", response_class=HTMLResponse)
async def sign_up():
  auth_page_template = template_env.get_template("auth_page.jinja").module.AuthPage # type: ignore
  page = auth_page_template('sign-up')
  return page

@router.post('/sign-up')
async def sign_up_post(
  session: SessionDep,
  full_name: Annotated[str, Form()], 
  email: Annotated[str, Form()],
  password: Annotated[str, Form()],
  confirm_password: Annotated[str, Form()]):
  try:
    assert password == confirm_password
    encrypted_password = encrypt_password(password)
    new_user = User(
      name=full_name,
      email=email,
      password=encrypted_password,
      created_at=datetime.now()
    )
    add_user(session, new_user)
    return RedirectResponse(url="/sign-in", status_code=302)
  except Exception as e:
    return f'failed sign up {e}'