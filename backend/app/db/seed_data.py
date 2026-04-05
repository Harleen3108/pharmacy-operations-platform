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

        # 2. Stores (Expanded to 18)
        print("Seeding Expanded Store Network (18 Branches)...")
        store_definitions = [
            ("Main St. Central Pharmacy", "124 Main St, Downtown", "555-0101"),
            ("Airport Terminal Branch", "Terminal 2, International Airport", "555-0102"),
            ("North Hill Plaza", "88 North Hill Rd, Suburbs", "555-0103"),
            ("East Side Wellness", "45 East Ave, Industrial Park", "555-0104"),
            ("West End Medics", "12 West Blvd, Residential", "555-0105"),
            ("South Gate Health", "99 South St, Business District", "555-0106"),
            ("Garden City Pharmacy", "Block 4, Garden City", "555-0107"),
            ("Riverfront Meds", "Riverside Walk, Uptown", "555-0108"),
            ("Metro Station Store", "Underground Plaza, Central Station", "555-0109"),
            ("Lakeview Dispensary", "12 Lake Rd, Scenic Area", "555-0110"),
            ("Highland Drug Store", "Highland Mall, 3rd Floor", "555-0111"),
            ("Valley View Pharmacy", "Valley View Green, Sector 7", "555-0112"),
            ("Silver Oaks Medics", "Silver Oaks Tower, Lobby", "555-0113"),
            ("Vikas Nagar Pharma", "Vikas Nagar Main Rd", "555-0114"),
            ("Gandhi Square Branch", "Gandhi Square, Historic Center", "555-0115"),
            ("Cyber Park Meds", "Tech Hub, Building C", "555-0116"),
            ("Sunshine Clinic Pharmacy", "Sunshine Hospital, Ground Floor", "555-0117"),
            ("Elite Wellness Center", "Premium Residency Area, Sector 1", "555-0118")
        ]
        
        stores = []
        for name, loc, contact in store_definitions:
            s = Store(name=name, location=loc, contact_number=contact)
            db.add(s)
            stores.append(s)
        db.commit()

        # 3. Users (Updated with more staff)
        print("Seeding Staff across Network...")
        users = [
            User(username="admin", email="admin@clinicalatelier.com", password_hash=get_password_hash("admin123"), role_id=1, store_id=1, full_name="Admin User"),
            User(username="elena", email="elena@clinicalatelier.com", password_hash=get_password_hash("pass123"), role_id=2, store_id=1, full_name="Elena Rodriguez"),
            User(username="bill_staff1", email="staff1@clinicalatelier.com", password_hash=get_password_hash("pass123"), role_id=3, store_id=1, full_name="Manoj Kumar"),
            User(username="bill_staff2", email="staff2@clinicalatelier.com", password_hash=get_password_hash("pass123"), role_id=3, store_id=2, full_name="Sita Sharma"),
            User(username="bill_staff3", email="staff3@clinicalatelier.com", password_hash=get_password_hash("pass123"), role_id=3, store_id=3, full_name="Arjun Singh"),
        ]
        db.add_all(users)
        db.commit()

        # 4. Products (Remains same)
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

        # 5. Inventory and Batches (Seeded for ALL Stores)
        print("Seeding Inventory across 18 Branches...")
        for s in stores:
            for p in products:
                inv = Inventory(store_id=s.id, product_id=p.id, reorder_level=20)
                db.add(inv)
                db.flush()

                batch = Batch(
                    inventory_id=inv.id,
                    batch_number=f"B-{p.sku}-{s.id}",
                    expiry_date=date.today() + timedelta(days=random.randint(180, 720)),
                    cost_price=5.00,
                    selling_price=12.50,
                    initial_quantity=100,
                    current_quantity=random.randint(40, 90)
                )
                db.add(batch)
        db.commit()

        # 6. Sales History across Network
        print("Seeding Analytics for All Branches...")
        customers = [
            ("Alice Green", "9876543210"),
            ("Bob Brown", "9876543211"),
            ("Charlie Davis", "9876543212"),
            ("Diana Prince", "9876543213")
        ]
        
        for i in range(7): # Last 7 days
            sale_date = datetime.now() - timedelta(days=i)
            for s in stores:
                # Every store get some sales (3-10 per day)
                for _ in range(random.randint(3, 10)):
                    cust = random.choice(customers)
                    total = random.uniform(200, 2500) if s.id % 3 == 0 else random.uniform(50, 400)
                    sale = Sale(
                        store_id=s.id, 
                        associate_id=1, 
                        total_amount=total, 
                        customer_name=cust[0],
                        customer_mobile=cust[1],
                        payment_method=random.choice(["cash", "card"]),
                        created_at=sale_date
                    )
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
