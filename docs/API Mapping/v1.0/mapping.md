# API Mapping: v1.0

## Overview

Purpose:
- Initial API mapping for v1.0 of the application.

Actors:
- Authenticated User

## Flow Map

| Flow | Actor | Endpoint | Purpose |
|---|---|---|---|
| View current diaries | Authenticated User | GET /diaries | Return a list of all diaries belonging to the authenticated user |
| View pages in a diary | Authenticated User | GET /diaries/{diary_id}/pages | Return a list of all pages belonging to a diary belonging to the authenticated user |
| Create a diary | Authenticated User | POST /diaries | Create a diary belonging to the authenticated user |
| Create diary page | Authenticated User | POST /diaries/{diary_id}/pages | Create a page in a diary belonging to the authenticated user |

## Endpoint Contracts

### GET /diaries

Purpose:
- Return a list of diaries belonging to the authenticated user

Auth:
- Required: yes
- Roles: None
- Ownership rule: Must be assigned to each diary that is returned

Headers:
- Authorisation: Bearer JWT

Response: 200
[
    {
        "id": int,
        "name": str
    }
]

Errors:
- 401: Missing or invalid token

Implementation Mapping:
- Router: /routers/diaries.py
- Model: Diary
- Schema: DiaryRead

### GET /diaries/{diary_id}/pages

Purpose:
- Return a list of all pages belonging to a diary belonging to the authenticated user

Auth:
- Required: yes
- Roles: None
- Ownership rule: Must be assigned to the diary of the pages that are returned

Headers:
- Authorisation: Bearer JWT

Response: 200
[
    {
        "id": int,
        "created_at": datetime,
        "content": str
    }
]

Errors:
- 401: Missing or invalid token
- 404: Resource Not Found

Implementation Mapping:
- Router: /routers/diaries.py
- Model: Page
- Schema: PageRead

### POST /diaries

Purpose:
- Create a diary belonging to the authenticated user

Auth:
- Required: yes
- Roles: None
- Ownership rule: None

Headers:
- Authorisation: Bearer JWT

Body:
{
    "name": str
}

Response: 201
{
    "id": int,
    "name": str
}

Errors:
- 400: Invalid request body
- 401: Missing or invalid token

Implementation Mapping:
- Router: /routers/diaries.py
- Model: Diary
- Input Schema: DiaryCreate
- Output Schema: DiaryRead

### POST /diaries/{diary_id}/pages

Purpose:
- Create a page in a diary belonging to the authenticated user

Auth:
- Required: yes
- Roles: None
- Ownership rule: Must be assigned to the diary that the pages are being created under

Headers:
- Authorisation: Bearer JWT

Body:
{
    "content": str
}

Response: 201
{
    "id": int,
    "created_at": datetime,
    "content": str
}

Errors:
- 400: Invalid request body
- 401: Missing or invalid token
- 404: Resource Not Found

Implementation Mapping:
- Router: /routers/diaries.py
- Model: Page
- Input Schema: PageCreate
- Output Schema: PageRead