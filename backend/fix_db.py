import sqlite3
import os

# Connect to the database
db_path = "backend/pharmacy.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create Tables if they are missing
print("Checking for tables...")
cursor.execute("""
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    location TEXT,
    contact_number TEXT
)
""")

# Seed Roles
roles = [
    ("District Admin", "Top-level management with cross-store access"),
    ("Store Supervisor", "Manager of a single store"),
    ("Pharmacist", "Licensed pharmacist for prescription validation"),
    ("Associate", "Counter staff for billing and sales")
]

for name, desc in roles:
    try:
        cursor.execute("INSERT INTO roles (name, description) VALUES (?, ?)", (name, desc))
        print(f"Created role: {name}")
    except sqlite3.IntegrityError:
        print(f"Role already exists: {name}")

# Seed Store
store_name = "Main St. Central Pharmacy"
try:
    cursor.execute("INSERT INTO stores (name, location, contact_number) VALUES (?, ?, ?)", 
                   (store_name, "Downtown Metro", "555-0101"))
    print(f"Created store: {store_name}")
except sqlite3.IntegrityError:
    print(f"Store already exists: {store_name}")

conn.commit()
conn.close()
print("Database repair complete.")
