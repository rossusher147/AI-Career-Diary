from typing import Annotated, Any, Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError

from src.backend.api.core.config import get_settings

settings = get_settings()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.keycloak_authorization_url,
    tokenUrl=settings.keycloak_token_url,
    scopes={
        "openid": "OpenID Connect",
        "profile": "User profile",
        "email": "Email address",
    },
)

jwks_client = PyJWKClient(settings.keycloak_jwks_url)


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> dict[str, Any]:
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.keycloak_api_audience,
            issuer=settings.keycloak_issuer,
            options={
                "require": ["exp", "iat", "iss", "sub"],
            },
        )

        return payload

    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def require_realm_role(required_role: str) -> Callable:
    def checker(
        user: Annotated[dict[str, Any], Depends(get_current_user)],
    ) -> dict[str, Any]:
        roles = user.get("realm_access", {}).get("roles", [])

        if required_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required role: {required_role}",
            )

        return user

    return checker