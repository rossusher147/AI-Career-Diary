from functools import lru_cache
from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_file_name: ClassVar[str] = "AICD.db"
    SERVICE_DIR: ClassVar[Path] = Path(__file__).resolve().parents[2]
    DB_PATH: ClassVar[Path] = SERVICE_DIR / "data" / database_file_name
    DB_PATH.parent.mkdir(exist_ok=True)
    database_url: str = f"sqlite:///{DB_PATH}"

    keycloak_base_url: str = "http://localhost:8080"
    keycloak_backend_base_url: str | None = None
    keycloak_realm: str = "aicd"

    keycloak_frontend_client_id: str = "aicd-ui"
    keycloak_api_audience: str = "aicd-api"
    backend_cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def keycloak_issuer(self) -> str:
        return f"{self.keycloak_base_url}/realms/{self.keycloak_realm}"

    @property
    def keycloak_authorization_url(self) -> str:
        return f"{self.keycloak_issuer}/protocol/openid-connect/auth"

    @property
    def keycloak_token_url(self) -> str:
        return f"{self.keycloak_issuer}/protocol/openid-connect/token"

    @property
    def keycloak_jwks_url(self) -> str:
        base_url = self.keycloak_backend_base_url or self.keycloak_base_url
        return f"{base_url}/realms/{self.keycloak_realm}/protocol/openid-connect/certs"

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
