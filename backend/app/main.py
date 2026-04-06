from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.api.v1 import auth, inventory, sales, analytics, ai, users, roles, stores, prescriptions, transfers
from app.core.config import settings
from app.db.session import engine, Base
# Import models to ensure they are registered with Base
from app.models import models

app = FastAPI(
    title="OMNICHANNEL PHARMACY OPERATIONS PLATFORM API",
    description="Backend services for omnichannel pharmacy chain operations.",
    version="1.0.0"
)

# Create Database Tables on Startup
Base.metadata.create_all(bind=engine)

def init_db():
    from app.db.session import SessionLocal
    from app.models.models import Role, Store, User, Product, Inventory, Batch, Sale, SaleItem
    from app.core.security import get_password_hash
    from datetime import datetime, timedelta
    import random
    
    db = SessionLocal()
    try:
        # 1. Seed Roles
        if not db.query(Role).first():
            roles = [
                Role(id=1, name="District Admin", description="System Administrator"),
                Role(id=2, name="Store Supervisor", description="Store Supervisor"),
                Role(id=3, name="Pharmacist", description="Licensed Pharmacist"),
                Role(id=4, name="Associate", description="Sales Associate")
            ]
            db.add_all(roles)
            db.flush()
            print("Seeded roles.")

        # 2. Seed Stores (1 Main Hub + 18 Regional Branches = 19 Total)
        if not db.query(Store).first():
            stores = [Store(id=1, name="Main St. Central Hub", location="Downtown Center", contact_number="555-0101")]
            
            locations = [
                "North Gate", "Riverside", "East Hill", "West Park", "Old Town", 
                "Central Plaza", "South Shore", "Garden District", "High Ridge", "Harbor View",
                "Pine Valley", "Oak Creek", "Maple Square", "Sunrise Heights", "Valley Glen",
                "Shadow Hills", "Lakeside", "Iron Forge"
            ]
            
            for i, loc in enumerate(locations):
                stores.append(Store(id=i+2, name=f"Regional Pharmacy {loc}", location=loc, contact_number=f"555-0{i+102}"))
            
            db.add_all(stores)
            db.flush()
            print(f"Seeded {len(stores)} stores.")

        # 3. Seed Users
        users_to_seed = [
            {"username": "admin", "pwd": "admin123", "role": 1, "name": "System Admin"},
            {"username": "supervisor01", "pwd": "supervisor123", "role": 2, "name": "Store Supervisor"},
            {"username": "pharmacist01", "pwd": "pharmacist123", "role": 3, "name": "Pharmacist"},
            {"username": "associate01", "pwd": "associate123", "role": 4, "name": "Store Associate"}
        ]
        for u in users_to_seed:
            if not db.query(User).filter(User.username == u["username"]).first():
                user = User(
                    username=u["username"], 
                    email=f"{u['username']}@pharmacy.com",
                    password_hash=get_password_hash(u["pwd"]),
                    role_id=u["role"],
                    store_id=1,
                    full_name=u["name"]
                )
                db.add(user)
                print(f"Seeded user: {u['username']}")

        # 4. Seed Products & Inventory for all 19 branches
        if not db.query(Product).first():
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
            
            all_stores = db.query(Store).all()
            for p_data in products_data:
                prod = Product(name=p_data["name"], category=p_data["cat"], is_prescription_required=True)
                db.add(prod)
                db.flush()
                
                # Add to EVERY store
                for store in all_stores:
                    inv = Inventory(store_id=store.id, product_id=prod.id, reorder_level=10)
                    db.add(inv)
                    db.flush()
                    
                    # Randomize stock levels across the network
                    for i in range(random.randint(1, 2)):
                        # Some stores have low stock on purpose
                        qty = random.randint(5, 50) if random.random() > 0.15 else random.randint(1, 8)
                        batch = Batch(
                            inventory_id=inv.id, batch_number=f"B-{store.id}-{prod.id}-{i}", 
                            expiry_date=(datetime.now() + timedelta(days=random.randint(20, 600))).date(),
                            cost_price=p_data["cost"], selling_price=p_data["price"],
                            initial_quantity=qty + 20, current_quantity=qty
                        )
                        db.add(batch)
            print(f"Seeded products & inventory for {len(all_stores)} stores.")

        # 5. Network-Wide 7-Day Sales History
        if not db.query(Sale).first():
            all_batches = db.query(Batch).all()
            # Map batches to stores
            from collections import defaultdict
            store_batches = defaultdict(list)
            for b in all_batches:
                inv = db.query(Inventory).get(b.inventory_id)
                store_batches[inv.store_id].append(b)
                
            all_stores = db.query(Store).all()
            admin_user = db.query(User).filter(User.username == "admin").first()
            
            for store in all_stores:
                for i in range(7):
                    sale_date = datetime.now() - timedelta(days=i)
                    # Different stores have different volume
                    tx_count = random.randint(8, 25) if store.id == 1 else random.randint(5, 15)
                    for _ in range(tx_count):
                        sale = Sale(
                            store_id=store.id, 
                            user_id=admin_user.id, 
                            customer_name="Retail Customer",
                            total_amount=0, 
                            created_at=sale_date,
                            payment_method="UPI" if random.random() > 0.5 else "Cash"
                        )
                        db.add(sale)
                        db.flush()
                        
                        total = 0
                        batches = store_batches[store.id]
                        if not batches: continue
                        
                        for _ in range(random.randint(1, 3)):
                            b = random.choice(batches)
                            qty = random.randint(1, 3)
                            item_total = qty * float(b.selling_price)
                            item = SaleItem(sale_id=sale.id, batch_id=b.id, quantity=qty, unit_price=b.selling_price, subtotal=item_total)
                            db.add(item)
                            total += item_total
                        
                        sale.total_amount = total
            print(f"Seeded massive 7-day sales network cross-linked for {len(all_stores)} stores.")

        db.commit()
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

init_db()

# Set up CORS - Explicit origins required for credentialed requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales & Billing"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["BI Dashboards"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Features"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Staff Management"])
app.include_router(roles.router, prefix="/api/v1/roles", tags=["Roles & Permissions"])
app.include_router(stores.router, prefix="/api/v1/stores", tags=["Store Locations"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["Clinical Services"])
app.include_router(transfers.router, prefix="/api/v1/transfers", tags=["Replenishment"])

@app.get("/", include_in_schema=False)
def read_root():
    return RedirectResponse(url="/docs")
