import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    url = settings.DATABASE_URL
    if not url:
        url = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    
    print(f"Connecting to {url}...")
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            # Check if phone_number exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='phone_number'"))
            if not result.fetchone():
                print("Adding phone_number column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20)"))
                conn.commit()
                print("Migration successful.")
            else:
                print("Column phone_number already exists.")
    except Exception as e:
        print(f"Migration failed: {e}")
        print("Attempting SQLite fallback if pharmacy.db exists...")
        if os.path.exists("pharmacy.db"):
            import sqlite3
            conn = sqlite3.connect("pharmacy.db")
            try:
                conn.execute("ALTER TABLE users ADD COLUMN phone_number TEXT")
                conn.commit()
                print("SQLite migration successful.")
            except Exception as se:
                print(f"SQLite migration failed or already exists: {se}")
            finally:
                conn.close()

if __name__ == "__main__":
    # Add parent dir to path to import app
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    migrate()
