from fastapi import FastAPI
from app.controllers import todo_routes, chat_routes
from contextlib import asynccontextmanager
from app.models.chat import create_db_and_tables
from sqlmodel import create_engine
from app.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
  create_db_and_tables(engine)
  print("db and tables created")
  yield

app = FastAPI(lifespan=lifespan)
app.include_router(chat_routes.router)
