from fastapi import (
  Request,
  Response,
  HTTPException,
  Form,
  APIRouter,
  Depends,
  WebSocket,
)
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlmodel import Session
from typing import Annotated
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from app.database import get_session
from app.auth import encrypt_password, check_encrypted_password
from app.models.sql_models import User, add_user, get_user
from datetime import datetime
from starlette.status import HTTP_302_FOUND

templates = Jinja2Templates(directory="templates")
template_env = Environment(loader=FileSystemLoader("templates"))

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/sign-in", response_class=HTMLResponse)
async def sign_in(request: Request):
  print("cookies", request.cookies)
  auth_page_template = template_env.get_template("auth_page.jinja").module.AuthPage  # type: ignore
  page = auth_page_template(
    form_type="sign-in",
    title="Sign In",
    fields=[
      {"title": "Email", "type": "email", "name": "email"},
      {"title": "Password", "type": "password", "name": "password"},
    ],
    button_command="Login",
  )
  return page


@router.post("/sign-in")
async def sign_in_post(
  session: SessionDep,
  email: Annotated[str, Form()],
  password: Annotated[str, Form()],
  request: Request,
):
  print("recieved email and pw: ", email, password)
  try:
    user = get_user(session, email)
    print("got user: ", user)
    assert user is not None, "Email not found"
    assert user.id is not None, "Email not found"
    password_check = check_encrypted_password(password, user.password)
    assert password_check, "Invalid password"
    response = HTMLResponse(content="", status_code=200, headers={"HX-Redirect": "/"})
    request.session["user_id"] = user.id
    # response_with_cookies = browser_session_manager.generate_session(user.id, response)
    return response
  except Exception as e:
    toast_template = template_env.get_template("auth_toast.jinja").module.AuthToastError  # type: ignore
    toast = toast_template(e)
    return HTMLResponse(
      content=toast,
      status_code=200,
    )


@router.get("/sign-up", response_class=HTMLResponse)
async def sign_up():
  auth_page_template = template_env.get_template("auth_page.jinja").module.AuthPage  # type: ignore
  page = auth_page_template(
    form_type="sign-up",
    title="Sign Up",
    fields=[
      {"title": "Full Name", "type": "text", "name": "full_name"},
      {"title": "Email", "type": "email", "name": "email"},
      {"title": "Password", "type": "password", "name": "password"},
      {"title": "Confirm Password", "type": "password", "name": "confirm_password"},
    ],
    button_command="Submit",
  )
  return page


@router.post("/sign-up")
async def sign_up_post(
  session: SessionDep,
  full_name: Annotated[str, Form()],
  email: Annotated[str, Form()],
  password: Annotated[str, Form()],
  confirm_password: Annotated[str, Form()],
):
  try:
    assert password == confirm_password, "Passwords must match"
    encrypted_password = encrypt_password(password)
    new_user = User(
      name=full_name,
      email=email,
      password=encrypted_password,
      created_at=datetime.now(),
    )
    add_user_status = add_user(session, new_user)
    assert add_user_status, "Failed to add user"
    return HTMLResponse(
      content="", status_code=200, headers={"HX-Redirect": "/sign-in"}
    )
  except Exception as e:
    toast_template = template_env.get_template("auth_toast.jinja").module.AuthToastError  # type: ignore
    toast = toast_template(e)
    return HTMLResponse(
      content=toast,
      status_code=200,
    )
