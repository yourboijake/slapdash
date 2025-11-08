from fastapi import FastAPI
from app.controllers import chat_routes, auth_routes
from contextlib import asynccontextmanager
from app.database import create_db_and_tables, engine
from starlette.middleware.sessions import SessionMiddleware
from dotenv import dotenv_values


@asynccontextmanager
async def lifespan(app: FastAPI):
  create_db_and_tables(engine)
  print("db and tables created")
  yield


config = dotenv_values(".env")
secret_key = config.get("COOKIE_SECRET")
if secret_key is None:
  raise Exception(
    "Unable to initialize browser session generator, must set COOKIE_SECRET in .env"
  )


app = FastAPI(lifespan=lifespan)
app.add_middleware(SessionMiddleware, secret_key=secret_key)
app.include_router(chat_routes.router)
app.include_router(auth_routes.router)
