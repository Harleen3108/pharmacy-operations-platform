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

        # 2. Seed Stores (Ensure at least 19 Total)
        current_store_count = db.query(Store).count()
        if current_store_count < 19:
            stores = []
            if current_store_count == 0:
                stores.append(Store(id=1, name="Main St. Central Hub", location="Downtown Center", contact_number="555-0101"))
            
            locations = [
                "North Gate", "Riverside", "East Hill", "West Park", "Old Town", 
                "Central Plaza", "South Shore", "Garden District", "High Ridge", "Harbor View",
                "Pine Valley", "Oak Creek", "Maple Square", "Sunrise Heights", "Valley Glen",
                "Shadow Hills", "Lakeside", "Iron Forge", "Market Street"
            ]
            
            # Start appending from where we left off
            start_idx = max(0, current_store_count - 1)
            for i in range(start_idx, 18):
                loc = locations[i]
                stores.append(Store(name=f"Regional Pharmacy {loc}", location=loc, contact_number=f"555-0{i+102}"))
            
            db.add_all(stores)
            db.flush()
            print(f"Ensured 19 stores (Added {len(stores)} missing).")

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

        # 4. Seed Products & Inventory for all branches
        if db.query(Product).count() < 10:
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
                    prod = Product(name=p_data["name"], category=p_data["cat"], is_prescription_required=True)
                    db.add(prod)
            db.flush()

        all_stores = db.query(Store).all()
        all_products = db.query(Product).all()
        for store in all_stores:
            if db.query(Inventory).filter(Inventory.store_id == store.id).count() < 5:
                for prod in all_products:
                    inv = Inventory(store_id=store.id, product_id=prod.id, reorder_level=10)
                    db.add(inv)
                    db.flush()
                    qty = random.randint(5, 50) if random.random() > 0.15 else random.randint(1, 8)
                    batch = Batch(
                        inventory_id=inv.id, batch_number=f"B-{store.id}-{prod.id}-01", 
                        expiry_date=(datetime.now() + timedelta(days=random.randint(20, 600))).date(),
                        cost_price=8.0, selling_price=12.5,
                        initial_quantity=qty + 20, current_quantity=qty
                    )
                    db.add(batch)
        print("Ensured all stores have products and inventory.")

        # 5. Network-Wide 7-Day Sales History (Ensure all stores have history)
        admin_user = db.query(User).filter(User.username == "admin").first()
        for store in all_stores:
            if db.query(Sale).filter(Sale.store_id == store.id).count() < 10:
                for i in range(7):
                    sale_date = datetime.now() - timedelta(days=i)
                    tx_count = random.randint(10, 30) if store.id == 1 else random.randint(5, 12)
                    for _ in range(tx_count):
                        sale = Sale(store_id=store.id, user_id=admin_user.id, customer_name="Customer", total_amount=0, created_at=sale_date)
                        db.add(sale)
                        db.flush()
                        
                        # Find a batch for this store
                        batches = db.query(Batch).join(Inventory).filter(Inventory.store_id == store.id).all()
                        if batches:
                            b = random.choice(batches)
                            qty = random.randint(1, 4)
                            sub = qty * float(b.selling_price)
                            item = SaleItem(sale_id=sale.id, batch_id=b.id, quantity=qty, unit_price=b.selling_price, subtotal=sub)
                            db.add(item)
                            sale.total_amount = sub
        print("Ensured all stores have 7-day sales history.")

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
