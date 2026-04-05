from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, inventory, sales, analytics, ai, users, roles, stores, prescriptions
from app.core.config import settings

app = FastAPI(
    title="Pharmacy Operations Platform API",
    description="Backend services for regional pharmacy chain operations.",
    version="1.0.0"
)

# Set up CORS
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

@app.get("/")
def read_root():
    return {"message": "Pharmacy Operations API is active", "status": "online"}
