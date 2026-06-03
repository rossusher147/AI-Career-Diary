from datetime import datetime
from sqlmodel import Session, select, func

from src.backend.api.models import Diary, Page, UserProfile

def get_diary_by_id_and_user(
    diary_id: int, 
    current_user: UserProfile, 
    session: Session,
) -> Diary | None:
    query = select(Diary).where(
        Diary.id == diary_id,
        Diary.author_id == current_user.keycloak_sub,
    )

    return session.exec(query).first()


def get_page_by_date(
    diary_id: int,
    date: datetime,
    session: Session,
    exclude_page_id: int | None = None,
) -> Page | None:
    """Check if a page already exists for the given diary on the same date (UTC)."""
    page_date = func.date(Page.created_at)
    target_date = date.date()
    
    query = select(Page).where(
        Page.diary_id == diary_id,
        page_date == target_date,
    )
    
    if exclude_page_id:
        query = query.where(Page.id != exclude_page_id)
    
    return session.exec(query).first()
