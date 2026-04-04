from app.db.session import Base
from app.models.models import User, Role, Store, Product, Batch, Inventory, Sale, SaleItem, PurchaseOrder

# This is used by Alembic and init_db scripts to ensure all models are registered
