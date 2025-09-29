from fastapi import FastAPI

from app.controllers import web_routes

app = FastAPI()
app.include_router(web_routes.router)