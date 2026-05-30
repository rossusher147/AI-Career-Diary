from datetime import datetime

from sqlmodel import SQLModel, Field


class DiaryCreate(SQLModel):
    name: str

class DiaryRead(SQLModel):
    id: int
    name: str


class PageCreate(SQLModel):
    content: str = Field(description="Raw Markdown content.")

class PageRead(SQLModel):
    id: int
    created_at: datetime
    content: str = Field(description="Raw Markdown content.")
