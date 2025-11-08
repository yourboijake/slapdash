import bcrypt
from pydantic import BaseModel
from uuid import UUID, uuid4
from dotenv import dotenv_values
from datetime import datetime, timedelta
from models.sql_models import BrowserSession
from sqlmodel import Session, select
import logging


def encrypt_password(password: str) -> bytes:
  pw_bytes = password.encode("utf-8")
  salt = bcrypt.gensalt()
  hashed_pw = bcrypt.hashpw(pw_bytes, salt)
  return hashed_pw


def check_encrypted_password(entered_password: str, encrypted_password: bytes) -> bool:
  entered_pw_bytes = entered_password.encode("utf-8")
  pw_check = bcrypt.checkpw(entered_pw_bytes, encrypted_password)
  return pw_check


config = dotenv_values(".env")
secret_key = config.get("COOKIE_SECRET")
if secret_key is None:
  raise Exception(
    "Unable to initialize browser session generator, must set COOKIE_SECRET in .env"
  )


class BrowserSessionDeletionResult:
  success: bool
  error: str | None


class BrowserSessionManager:
  async def create_session(
    self, user_id: int, db_session: Session
  ) -> BrowserSession | None:
    new_session = BrowserSession(
      user_id=user_id,
    )
    try:
      db_session.add(new_session)
      db_session.commit()
      return new_session
    except Exception as e:
      logging.error(e)
      return None

  async def get_session(
    self, session_id: int, db_session: Session
  ) -> BrowserSession | None:
    try:
      statement = select(BrowserSession).where(BrowserSession.id == session_id)
      results = db_session.exec(statement)
      browser_session = results.first()
      return browser_session
    except Exception as e:
      logging.error(e)
      return None

  async def delete_session(
    self, session_id: int, db_session: Session
  ) -> BrowserSessionDeletionResult:
    result = BrowserSessionDeletionResult()
    result.success = True
    result.error = ""
    return result

  async def format_session_response(self, session: BrowserSession) -> str:
    pass
