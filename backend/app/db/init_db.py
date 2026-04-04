from app.db.session import engine, Base
from app.db.base import User, Role, Store, Product, Batch, Inventory, Sale, SaleItem # Register all models

def init_db():
    print("Creating tables in database...")
    Base.metadata.drop_all(bind=engine) # Start fresh for prototype
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
