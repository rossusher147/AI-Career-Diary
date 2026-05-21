from sqlmodel import Session, select

from src.backend.api.models import Diary, UserProfile

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
