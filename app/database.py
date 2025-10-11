from sqlmodel import create_engine, Session
from contextlib import asynccontextmanager
from fastapi import FastAPI

# Database configuration
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

# Dependency for getting a database session
def get_session():
  with Session(engine) as session:
    yield session