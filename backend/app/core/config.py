from typing import List, Union, Any
from pydantic import field_validator

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

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v
    
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
