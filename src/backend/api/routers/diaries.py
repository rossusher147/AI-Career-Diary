from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.backend.api.database import get_session
from src.backend.api.models import Diary, Page, UserProfile
from src.backend.api.dependecies import get_or_create_current_profile
from src.backend.api.schemas import DiaryCreate, DiaryRead, PageCreate, PageRead
from src.backend.api.services.diaries import get_diary_by_id_and_user

router = APIRouter(
    prefix="/diaries",
    tags=["diary_controller"]
)

SessionDep = Annotated[Session, Depends(get_session)]
CurrentUserDep = Annotated[UserProfile, Depends(get_or_create_current_profile)]


@router.get(
    "",
    response_model=list[DiaryRead],
    status_code=status.HTTP_200_OK,
    summary="Return a list of diaries belonging to the authenticated user",
)
def get_diaries(current_user: CurrentUserDep):
    return current_user.diaries


@router.get(
    "/{diary_id}/pages",
    response_model=list[PageRead],
    status_code=status.HTTP_200_OK,
    summary="Return a list of all pages belonging to a diary belonging to the authenticated user",
)
def get_diary_pages(diary_id: int, session: SessionDep, current_user: CurrentUserDep):
    diary = get_diary_by_id_and_user(diary_id, current_user, session)
    if diary is None:
        raise HTTPException(status_code=404, detail="Diary not found")
    
    return diary.pages


@router.post(
    "",
    response_model=DiaryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a diary belonging to the authenticated user",
)
def create_diary(diary_in: DiaryCreate, session: SessionDep, current_user: CurrentUserDep):
    diary = Diary.model_validate(
        diary_in,
        update={"author_id": current_user.keycloak_sub}
    )
    session.add(diary)
    session.commit()
    session.refresh(diary)
    return diary


@router.post(
    "/{diary_id}/pages",
    response_model=PageRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a page in a diary belonging to the authenticated user",
)
def create_page(page_in: PageCreate, diary_id: int, session: SessionDep, current_user: CurrentUserDep):
    diary = get_diary_by_id_and_user(diary_id, current_user, session)
    if diary is None:
        raise HTTPException(status_code=404, detail="Diary not found")
    
    page = Page.model_validate(
        page_in,
        update={"diary_id": diary_id}
    )
    session.add(page)
    session.commit()
    session.refresh(page)
    return page
