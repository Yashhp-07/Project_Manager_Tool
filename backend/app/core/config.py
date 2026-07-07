"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the application.

    Loads values from environment variables or a .env file.
    All environment-specific configuration lives here.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    database_url: str = ""

    cors_origins: list[str] = ["http://localhost:5173"]

    # LLM — single provider (OpenAI-compatible)
    api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o"


settings = Settings()
