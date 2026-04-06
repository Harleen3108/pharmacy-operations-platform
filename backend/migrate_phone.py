import sqlite3
import os

db_path = "backend/pharmacy.db"
if not os.path.exists(db_path):
    db_path = "pharmacy.db" # Fallback if run from backend dir

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add phone_number to users table
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone_number TEXT")
        print("Successfully added phone_number column to users table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column phone_number already exists.")
        else:
            print(f"Error: {e}")
            
    conn.commit()
    conn.close()
    print("Migration complete.")
except Exception as e:
    print(f"Migration failed: {e}")
