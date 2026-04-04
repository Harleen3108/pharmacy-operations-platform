from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import Role, Store, User, Product, Inventory, Batch, Sale, SaleItem
from app.core.security import get_password_hash
from datetime import date, datetime, timedelta
import random

def seed():
    db = SessionLocal()
    try:
        # 1. Roles
        print("Seeding Roles...")
        roles = [
            Role(name="District Admin", description="Full system access across all stores"),
            Role(name="Pharmacist", description="Clinical validation and inventory management"),
            Role(name="Sales Associate", description="Point of sale and customer service")
        ]
        db.add_all(roles)
        db.commit()

        # 2. Stores
        print("Seeding Stores...")
        stores = [
            Store(name="Main St. Central Pharmacy", location="124 Main St, Downtown", contact_number="555-0101"),
            Store(name="Airport Terminal Branch", location="Terminal 2, International Airport", contact_number="555-0102"),
            Store(name="North Hill Plaza", location="88 North Hill Rd, Suburbs", contact_number="555-0103")
        ]
        db.add_all(stores)
        db.commit()

        # 3. Users with hashed passwords
        print("Seeding Users...")
        users = [
            User(username="admin", email="admin@clinicalatelier.com", password_hash=get_password_hash("admin123"), role_id=1, store_id=1, full_name="Admin User"),
            User(username="elena", email="elena@clinicalatelier.com", password_hash=get_password_hash("pass123"), role_id=2, store_id=1, full_name="Elena Rodriguez")
        ]
        db.add_all(users)
        db.commit()

        # 4. Products
        print("Seeding Products...")
        products = [
            Product(name="Amoxicillin 500mg", generic_name="Amoxicillin", category="Antibiotics", sku="AMX-500-CP", is_prescription_required=True, unit_measure="capsule"),
            Product(name="Lisinopril 10mg", generic_name="Lisinopril", category="Cardiovascular", sku="LIS-010-TB", is_prescription_required=True, unit_measure="tablet"),
            Product(name="Paracetamol 650mg", generic_name="Acetaminophen", category="Analgesics", sku="PCM-650-TB", is_prescription_required=False, unit_measure="tablet"),
            Product(name="Metformin 850mg", generic_name="Metformin", category="Antidiabetic", sku="MET-850-TB", is_prescription_required=True, unit_measure="tablet"),
            Product(name="Cetirizine 10mg", generic_name="Cetirizine", category="Antihistamines", sku="CET-010-TB", is_prescription_required=False, unit_measure="tablet"),
            Product(name="Atorvastatin 20mg", generic_name="Atorvastatin", category="Statins", sku="ATR-020-TB", is_prescription_required=True, unit_measure="tablet")
        ]
        db.add_all(products)
        db.commit()

        # 5. Inventory and Batches for Store 1
        print("Seeding Inventory & Batches...")
        for p in products:
            inv = Inventory(store_id=1, product_id=p.id, reorder_level=20)
            db.add(inv)
            db.flush() # Get inv.id

            # Create 2 batches for each product
            batch1 = Batch(
                inventory_id=inv.id,
                batch_number=f"B-{p.sku}-01",
                expiry_date=date.today() + timedelta(days=random.randint(180, 720)),
                cost_price=5.00,
                selling_price=12.50,
                initial_quantity=100,
                current_quantity=random.randint(40, 90)
            )
            batch2 = Batch(
                inventory_id=inv.id,
                batch_number=f"B-{p.sku}-02",
                expiry_date=date.today() + timedelta(days=random.randint(30, 90)), # Near expiry
                cost_price=5.00,
                selling_price=12.50,
                initial_quantity=100,
                current_quantity=random.randint(10, 30)
            )
            db.add_all([batch1, batch2])

        db.commit()

        # 6. Some initial Sales for Analytics (Last 7 days)
        print("Seeding Sales History...")
        for i in range(7):
            sale_date = datetime.now() - timedelta(days=i)
            # Create 5-10 sales per day
            for _ in range(random.randint(5, 10)):
                total = random.uniform(50, 200)
                sale = Sale(store_id=1, associate_id=2, total_amount=total, created_at=sale_date)
                db.add(sale)
        
        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
