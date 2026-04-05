from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Numeric, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(Text)
    contact_number = Column(String(20))
    is_active = Column(Boolean, default=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    store_id = Column(Integer, ForeignKey("stores.id"))
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    generic_name = Column(String(255))
    description = Column(Text)
    category = Column(String(100))
    sku = Column(String(50), unique=True, index=True)
    is_prescription_required = Column(Boolean, default=False)
    unit_measure = Column(String(20), default="tablet")

class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"))
    batch_number = Column(String(50), nullable=False)
    expiry_date = Column(Date, nullable=False)
    cost_price = Column(Numeric(12, 2), nullable=False)
    selling_price = Column(Numeric(12, 2), nullable=False)
    initial_quantity = Column(Integer, nullable=False)
    current_quantity = Column(Integer, nullable=False)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    reorder_level = Column(Integer, default=10)

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    associate_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Numeric(12, 2), nullable=False)
    customer_name = Column(String(100), nullable=True) # captured during billing
    customer_mobile = Column(String(20), nullable=True)
    payment_method = Column(String(20), default="cash") # cash, card, online
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, server_default=func.now())

    store = relationship("Store")
    associate = relationship("User")

class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    batch_id = Column(Integer, ForeignKey("batches.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"))
    quantity_suggested = Column(Integer, nullable=False)
    status = Column(String(50), default="pending")
    source = Column(String(50), default="AI_FORECAST")
    created_at = Column(DateTime, server_default=func.now())

class Prescription(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(100), nullable=False)
    rx_number = Column(String(50), unique=True, index=True, nullable=False)
    medicines = Column(JSON, nullable=False) # List of {name, dosage}
    type = Column(String(20), default="standard") # standard, restricted, controlled
    status = Column(String(20), default="pending") # pending, validated, rejected
    compliance_flags = Column(JSON, default=lambda: {
        "practitioner_verified": True,
        "interaction_check": True,
        "allergy_match": True,
        "substance_registry": True
    })
    store_id = Column(Integer, ForeignKey("stores.id"))
    pharmacist_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    validated_at = Column(DateTime, nullable=True)
class StockTransfer(Base):
    __tablename__ = "stock_transfers"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    from_store_id = Column(Integer, ForeignKey("stores.id"))
    to_store_id = Column(Integer, ForeignKey("stores.id"))
    quantity = Column(Integer, nullable=False)
    status = Column(String(50), default="pending") # pending, approved, shipped, received, cancelled
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    product = relationship("Product")
    from_store = relationship("Store", foreign_keys=[from_store_id])
    to_store = relationship("Store", foreign_keys=[to_store_id])
