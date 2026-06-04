"""SQLModel table definitions.

Import this module in Alembic so SQLModel metadata includes every table model.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Text
from sqlmodel import SQLModel, Field, Relationship


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserProfile(SQLModel, table=True):
    __tablename__ = "userprofile"

    keycloak_sub: str = Field(primary_key=True)

    diaries: list["Diary"] = Relationship(back_populates="author")


class Diary(SQLModel, table=True):
    __tablename__ = "diary"

    id: int | None = Field(default=None, primary_key=True)
    name: str

    author_id: str = Field(foreign_key="userprofile.keycloak_sub")
    author: UserProfile = Relationship(back_populates="diaries")

    pages: list["Page"] = Relationship(back_populates="diary")


class Page(SQLModel, table=True):
    __tablename__ = "page"

    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utc_now)
    content: str = Field(sa_column=Column(Text, nullable=False))

    diary_id: int = Field(foreign_key="diary.id")
    diary: Diary = Relationship(back_populates="pages")
