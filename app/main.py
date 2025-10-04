from fastapi import FastAPI
from app.controllers import todo_routes, chat_routes
from contextlib import asynccontextmanager
from app.models.chat import create_db_and_tables
from sqlmodel import create_engine

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

@asynccontextmanager
async def lifespan(app: FastAPI):
  create_db_and_tables(engine)
  print("db and tables created")
  yield

app = FastAPI(lifespan=lifespan)
app.include_router(chat_routes.router)
#app.include_router(todo_routes.router)