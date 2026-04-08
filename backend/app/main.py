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

from app.db.init_db import init_db

# Create Database Tables on Startup
Base.metadata.create_all(bind=engine)

# Conditional seeding (e.g., during first deployment or reset)
if settings.SEED_DB:
    print("SEED_DB flag detected. Running database seeding...")
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
