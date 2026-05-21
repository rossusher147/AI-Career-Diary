from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.backend.api import models
from src.backend.api.database import create_db_and_tables
from src.backend.api.routers import health, diaries

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(health.router)
app.include_router(diaries.router)
