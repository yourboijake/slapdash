from fastapi import FastAPI
from app.controllers import chat_routes, auth_routes
from contextlib import asynccontextmanager
from app.database import create_db_and_tables
from app.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables(engine)
    print("db and tables created")
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(chat_routes.router)
app.include_router(auth_routes.router)
