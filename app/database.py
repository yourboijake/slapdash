from sqlmodel import create_engine, Session
from sqlmodel import SQLModel
import bcrypt

def create_db_and_tables(engine):
  SQLModel.metadata.create_all(engine)

# Database configuration
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def get_session():
  with Session(engine) as session:
    yield session

def encrypt_password(password: str) -> bytes:
  pw_bytes = password.encode('utf-8')
  salt = bcrypt.gensalt()
  hashed_pw = bcrypt.hashpw(pw_bytes, salt)
  return hashed_pw

def check_encrypted_password(
    entered_password: str, 
    encrypted_password: bytes
    ) -> bool:
  entered_pw_bytes = entered_password.encode('utf-8')
  pw_check = bcrypt.checkpw(entered_pw_bytes, encrypted_password)
  return pw_check