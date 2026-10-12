import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic AI Customer Support Resolution System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # JWT Security
    SECRET_KEY: str = "super-secret-jwt-key-agentic-ai-customer-support-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # Default to SQLite for zero-config local run, supports PostgreSQL via DATABASE_URL
    DATABASE_URL: str = "sqlite+aiosqlite:///./support_system.db"
    
    # LLM Settings (Supports Gemini, OpenAI, or local/mock)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DEFAULT_LLM_PROVIDER: str = "auto"  # 'gemini', 'openai', or 'auto'
    
    # Vector Search & RAG
    VECTOR_TOP_K: int = 4
    SIMILARITY_THRESHOLD: float = 0.65
    
    # Redis / Session Memory
    REDIS_URL: str = ""
    
    # Escalation Thresholds
    REFUND_AUTO_APPROVE_LIMIT: float = 100.0  # Refunds > $100 trigger Escalation Agent
    MAX_UNRESOLVED_TURNS: int = 3
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
