from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pharmacy Operations Platform"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "pharmacy_db"
    DATABASE_URL: str = "" # Full URI override for Render/Supabase
    
    JWT_SECRET: str = "SuperSecretKeyForJWT" # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480 # 8 hours

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://pharmacy-operations-platform.vercel.app"
    ]
    
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
