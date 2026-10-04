"""
FrameSense AI - Backend Configuration
Environment-based settings using Pydantic Settings.
"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "FrameSense AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
