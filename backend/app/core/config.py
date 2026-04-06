from pydantic_settings import BaseSettings
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
        "https://pharmacy-operations-platform-s17l.vercel.app",
        "https://pharmacy-operations-platform-s17l.vercel.app/login"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        # Default production origin that should always be allowed
        prod_origin = "https://pharmacy-operations-platform-s17l.vercel.app"
        
        origins = []
        if isinstance(v, str):
            if v.startswith("["):
                import json
                try:
                    origins = json.loads(v)
                except:
                    origins = [i.strip() for i in v.split(",")]
            else:
                origins = [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            origins = v
        else:
            return v

        # Ensure production origin is always present
        if prod_origin not in origins:
            origins.append(prod_origin)
            
        return origins
    
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
