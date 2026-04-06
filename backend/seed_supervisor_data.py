from app.db.session import SessionLocal
from app.models.models import User, Store, Sale, SaleItem, Inventory, Batch, Role
from datetime import datetime, timedelta
import random

def seed():
    db = SessionLocal()
    try:
        # 1. Ensure Store 14 exists
        store_14 = db.query(Store).filter(Store.id == 14).first()
        if not store_14:
            print("Store 14 not found. Creating...")
            store_14 = Store(id=14, name="Westwood Health Hub", location="Westwood Village", contact_number="555-0900")
            db.add(store_14)
            db.flush()

        # 2. Ensure Role 4 exists
        role_assoc = db.query(Role).filter(Role.id == 4).first()
        if not role_assoc:
            role_assoc = Role(id=4, name="Associate", description="Sales staff")
            db.add(role_assoc)
            db.flush()

        # 3. Create Associates for Store 14
        associates = [
            {"username": "jake_s14", "full_name": "Jake Peralta"},
            {"username": "amy_s14", "full_name": "Amy Santiago"}
        ]
        
        created_associates = []
        for a in associates:
            user = db.query(User).filter(User.username == a["username"]).first()
            if not user:
                user = User(
                    username=a["username"],
                    full_name=a["full_name"],
                    email=f"{a['username']}@pharmacy.com",
                    password_hash="fake_hash", # Not for login
                    role_id=4,
                    store_id=14
                )
                db.add(user)
                db.flush()
                print(f"Created associate: {a['full_name']}")
            created_associates.append(user)

        # 4. Get Inventory for Store 14
        inventories = db.query(Inventory).filter(Inventory.store_id == 14).all()
        if not inventories:
            print("No inventory in Store 14. Cannot seed sales.")
            return

        # 5. Seed Sales for last 7 days
        current_time = datetime.now()
        for i in range(7):
            date_to_seed = current_time - timedelta(days=i)
            # 3-5 sales per day
            num_sales = random.randint(3, 5)
            for _ in range(num_sales):
                assoc = random.choice(created_associates)
                
                # Create Sale
                sale = Sale(
                    store_id=14,
                    associate_id=assoc.id,
                    total_amount=0, # Will update
                    status="completed",
                    created_at=date_to_seed
                )
                db.add(sale)
                db.flush()

                # Add SaleItems
                total = 0
                num_items = random.randint(1, 3)
                selected_invs = random.sample(inventories, min(len(inventories), num_items))
                for inv in selected_invs:
                    batch = db.query(Batch).filter(Batch.inventory_id == inv.id).first()
                    if batch:
                        qty = random.randint(1, 3)
                        item_total = qty * batch.selling_price
                        sale_item = SaleItem(
                            sale_id=sale.id,
                            batch_id=batch.id,
                            quantity=qty,
                            unit_price=batch.selling_price,
                            subtotal=item_total
                        )
                        db.add(sale_item)
                        total += item_total
                
                sale.total_amount = total
                db.flush()

        db.commit()
        print("Successfully seeded Store 14 with 7-day sales and performance data.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
