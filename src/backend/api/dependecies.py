from typing import Annotated, Any

from fastapi import Depends
from sqlmodel import Session, select

from src.backend.api.core.security import get_current_user
from src.backend.api.database import get_session
from src.backend.api.models import UserProfile


def get_or_create_current_profile(
    token_user: Annotated[dict[str, Any], Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> UserProfile:
    keycloak_sub = token_user["sub"]

    statement = select(UserProfile).where(UserProfile.keycloak_sub == keycloak_sub)
    profile = session.exec(statement).first()

    if profile:
        return profile

    profile = UserProfile(
        keycloak_sub=keycloak_sub,
        username=token_user.get("preferred_username"),
        email=token_user.get("email"),
        display_name=token_user.get("name"),
    )

    session.add(profile)
    session.commit()
    session.refresh(profile)

    return profile