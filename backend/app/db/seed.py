from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.models import Role, User, Store, Base, Prescription
from app.core.security import get_password_hash

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Create Roles
    roles = [
        {"name": "District Admin", "description": "Top-level management with cross-store access"},
        {"name": "Store Supervisor", "description": "Manager of a single store"},
        {"name": "Pharmacist", "description": "Licensed pharmacist for prescription validation"},
        {"name": "Associate", "description": "Counter staff for billing and sales"}
    ]
    
    for r_data in roles:
        role = db.query(Role).filter(Role.name == r_data["name"]).first()
        if not role:
            role = Role(**r_data)
            db.add(role)
            db.commit()
            db.refresh(role)
            print(f"Created role: {role.name}")

    # Create a Default Store if none exists
    store = db.query(Store).first()
    if not store:
        store = Store(name="Main St. Central Pharmacy", location="Downtown Metro", contact_number="555-0101")
        db.add(store)
        db.commit()
        db.refresh(store)
        print(f"Created store: {store.name}")

    # Create Demo Users for each role
    demo_users = [
        ("admin", "admin123", "District Admin", "District Manager"),
        ("supervisor", "super123", "Store Supervisor", "Store Manager"),
        ("pharmacist", "pharma123", "Pharmacist", "Lead Pharmacist"),
        ("associate", "bill123", "Associate", "Billing Staff")
    ]

    for username, password, role_name, full_name in demo_users:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            role = db.query(Role).filter(Role.name == role_name).first()
            new_user = User(
                username=username,
                email=f"{username}@pharmacy.com",
                password_hash=get_password_hash(password),
                role_id=role.id,
                store_id=store.id,
                full_name=full_name
            )
            db.add(new_user)
            db.commit()
            print(f"Created user: {username} with role {role_name}")

    # Create Initial Prescriptions
    store = db.query(Store).first() # Ensure we have the store reference
    initial_rxs = [
        {
            "patient_name": "Alice Johnson",
            "rx_number": "RX-9021",
            "medicines": [{"name": "Amoxicillin", "dosage": "500mg"}],
            "type": "restricted",
            "status": "pending",
            "store_id": store.id
        },
        {
            "patient_name": "Robert Smith",
            "rx_number": "RX-9022",
            "medicines": [{"name": "Lisinopril", "dosage": "10mg"}],
            "type": "standard",
            "status": "pending",
            "store_id": store.id
        },
        {
            "patient_name": "Sarah Davis",
            "rx_number": "RX-9023",
            "medicines": [{"name": "Diazepam", "dosage": "5mg"}],
            "type": "controlled",
            "status": "pending",
            "store_id": store.id,
            "compliance_flags": {
                "practitioner_verified": True,
                "interaction_check": False, # Flagging an issue
                "allergy_match": True,
                "substance_registry": True
            }
        }
    ]

    for rx_data in initial_rxs:
        if not db.query(Prescription).filter(Prescription.rx_number == rx_data["rx_number"]).first():
            db.add(Prescription(**rx_data))
            db.commit()
            print(f"Created prescription: {rx_data['rx_number']}")

    db.close()

if __name__ == "__main__":
    seed_data()
