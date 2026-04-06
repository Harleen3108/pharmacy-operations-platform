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
    from app.models.models import Role, Store, User
    from app.core.security import get_password_hash
    
    db = SessionLocal()
    try:
        # 1. Seed Roles
        if not db.query(Role).first():
            roles = [
                Role(id=1, name="Admin", description="System Administrator"),
                Role(id=2, name="Supervisor", description="Store Supervisor"),
                Role(id=3, name="Pharmacist", description="Licensed Pharmacist"),
                Role(id=4, name="Associate", description="Sales Associate")
            ]
            db.add_all(roles)
            db.flush()
            print("Seeded roles.")

        # 2. Seed Default Store
        if not db.query(Store).first():
            store = Store(id=1, name="Main St. Central Pharmacy", location="Downtown", contact_number="555-0101")
            db.add(store)
            db.flush()
            print("Seeded default store.")

        # 3. Seed Admin User
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                username="admin", 
                email="admin@pharmacy.com",
                password_hash=get_password_hash("admin123"), # Default password
                role_id=1,
                store_id=1,
                full_name="System Administrator"
            )
            db.add(admin)
            db.commit()
            print("Seeded admin user.")
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
