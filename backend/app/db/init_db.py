from app.db.session import SessionLocal
from app.models.models import Role, Store, User, Product, Inventory, Batch, Sale, SaleItem
from app.core.security import get_password_hash
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import random

def init_db(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    
    try:
        # 1. Seed Roles
        role_data = [
            {"id": 1, "name": "District Admin", "desc": "System Administrator"},
            {"id": 2, "name": "Store Supervisor", "desc": "Store Supervisor"},
            {"id": 3, "name": "Pharmacist", "desc": "Licensed Pharmacist"},
            {"id": 4, "name": "Associate", "desc": "Sales Associate"}
        ]
        
        for r in role_data:
            existing_role = db.query(Role).filter(Role.name == r["name"]).first()
            if not existing_role:
                # We don't set ID manually to avoid sequence issues, unless necessary
                # But roles usually have fixed IDs. Let's try to be safe.
                db.add(Role(name=r["name"], description=r["desc"]))
        db.flush()
        print("Ensured roles are present.")

        # 2. Seed Stores (Ensure at least 19 Total)
        current_stores = db.query(Store).all()
        current_store_count = len(current_stores)
        
        if current_store_count < 19:
            locations = [
                "North Gate", "Riverside", "East Hill", "West Park", "Old Town", 
                "Central Plaza", "South Shore", "Garden District", "High Ridge", "Harbor View",
                "Pine Valley", "Oak Creek", "Maple Square", "Sunrise Heights", "Valley Glen",
                "Shadow Hills", "Lakeside", "Iron Forge", "Market Street"
            ]
            
            # If no stores exist, add the main hub first
            if current_store_count == 0:
                db.add(Store(name="Main St. Central Hub", location="Downtown Center", contact_number="555-0101"))
                db.flush()
                current_store_count = 1
            
            # Add missing stores
            missing_count = 19 - current_store_count
            existing_locations = [s.location for s in current_stores]
            
            added = 0
            for loc in locations:
                if added >= missing_count:
                    break
                if loc not in existing_locations:
                    db.add(Store(name=f"Regional Pharmacy {loc}", location=loc, contact_number=f"555-0{102+added}"))
                    added += 1
            
            db.flush()
            print(f"Ensured 19 stores (Added {added} missing).")

        # 3. Seed Users
        users_to_seed = [
            {"username": "admin", "pwd": "admin123", "role": "District Admin", "name": "System Admin"},
            {"username": "supervisor01", "pwd": "supervisor123", "role": "Store Supervisor", "name": "Store Supervisor"},
            {"username": "pharmacist01", "pwd": "pharmacist123", "role": "Pharmacist", "name": "Pharmacist"},
            {"username": "associate01", "pwd": "associate123", "role": "Associate", "name": "Store Associate"}
        ]
        
        first_store = db.query(Store).first()
        for u in users_to_seed:
            if not db.query(User).filter(User.username == u["username"]).first():
                role = db.query(Role).filter(Role.name == u["role"]).first()
                if role:
                    user = User(
                        username=u["username"], 
                        email=f"{u['username']}@pharmacy.com",
                        password_hash=get_password_hash(u["pwd"]),
                        role_id=role.id,
                        store_id=first_store.id if first_store else None,
                        full_name=u["name"]
                    )
                    db.add(user)
                    print(f"Seeded user: {u['username']}")
        db.flush()

        # 4. Seed Products & Inventory
        products_data = [
            {"name": "Amoxicillin 500mg", "cat": "Antibiotics", "price": 12.50, "cost": 8.00},
            {"name": "Paracetamol 500mg", "cat": "Analgesics", "price": 5.00, "cost": 2.00},
            {"name": "Metformin 500mg", "cat": "Antidiabetic", "price": 15.00, "cost": 10.00},
            {"name": "Atorvastatin 20mg", "cat": "Cardiovascular", "price": 22.00, "cost": 15.00},
            {"name": "Lanzoprazole 30mg", "cat": "Gastrointestinal", "price": 18.00, "cost": 11.00},
            {"name": "Amlodipine 5mg", "cat": "Cardiovascular", "price": 10.50, "cost": 7.00},
            {"name": "Azithromycin 500mg", "cat": "Antibiotics", "price": 25.00, "cost": 18.00},
            {"name": "Cetirizine 10mg", "cat": "Antihistamine", "price": 8.00, "cost": 4.00},
            {"name": "Losartan 50mg", "cat": "Cardiovascular", "price": 20.00, "cost": 14.00},
            {"name": "Ibuprofen 400mg", "cat": "Analgesics", "price": 7.50, "cost": 3.50}
        ]
        
        for p_data in products_data:
            if not db.query(Product).filter(Product.name == p_data["name"]).first():
                prod = Product(
                    name=p_data["name"], 
                    category=p_data["cat"], 
                    is_prescription_required=True,
                    sku=f"SKU-{p_data['name'][:3].upper()}-{random.randint(1000, 9999)}"
                )
                db.add(prod)
        db.flush()

        all_stores = db.query(Store).all()
        all_products = db.query(Product).all()
        
        for store in all_stores:
            # Only add inventory if missing
            current_inv_count = db.query(Inventory).filter(Inventory.store_id == store.id).count()
            if current_inv_count < 5:
                for prod in all_products:
                    # Check if this specific product is already in inventory for this store
                    existing_inv = db.query(Inventory).filter(
                        Inventory.store_id == store.id, 
                        Inventory.product_id == prod.id
                    ).first()
                    
                    if not existing_inv:
                        inv = Inventory(store_id=store.id, product_id=prod.id, reorder_level=10)
                        db.add(inv)
                        db.flush()
                        
                        qty = random.randint(5, 50) if random.random() > 0.15 else random.randint(1, 8)
                        batch = Batch(
                            inventory_id=inv.id, 
                            batch_number=f"B-{store.id}-{prod.id}-01", 
                            expiry_date=(datetime.now() + timedelta(days=random.randint(20, 600))).date(),
                            cost_price=8.0, 
                            selling_price=12.5,
                            initial_quantity=qty + 20, 
                            current_quantity=qty
                        )
                        db.add(batch)
        db.flush()
        print("Ensured all stores have products and inventory.")

        # 5. Sales History (Only if less than 10 sales)
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            for store in all_stores:
                if db.query(Sale).filter(Sale.store_id == store.id).count() < 10:
                    for i in range(7):
                        sale_date = datetime.now() - timedelta(days=i)
                        tx_count = random.randint(5, 15) if store.id == 1 else random.randint(2, 6)
                        for _ in range(tx_count):
                            sale = Sale(
                                store_id=store.id, 
                                associate_id=admin_user.id, 
                                customer_name="Walk-in Customer", 
                                total_amount=0, 
                                created_at=sale_date
                            )
                            db.add(sale)
                            db.flush()
                            
                            # Find a batch for this store
                            batches = db.query(Batch).join(Inventory).filter(Inventory.store_id == store.id).all()
                            if batches:
                                b = random.choice(batches)
                                qty = random.randint(1, 3)
                                sub = qty * float(b.selling_price)
                                item = SaleItem(
                                    sale_id=sale.id, 
                                    batch_id=b.id, 
                                    quantity=qty, 
                                    unit_price=b.selling_price, 
                                    subtotal=sub
                                )
                                db.add(item)
                                sale.total_amount = sub
        
        db.commit()
        print("Seeding completed successfully.")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    init_db()
