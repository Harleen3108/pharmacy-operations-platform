import sys
import os

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from app.core.config import settings

def verify_connection():
    db_url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@127.0.0.1:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    print(f"Attempting to connect to: {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB} as user {settings.POSTGRES_USER}")
    
    try:
        engine = create_engine(db_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            if result.fetchone()[0] == 1:
                print("✅ Successfully connected to the database!")
            else:
                print("❌ Connection test failed.")
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")

if __name__ == "__main__":
    verify_connection()
