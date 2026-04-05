from app.db.session import SessionLocal
from app.models.models import StockTransfer, Sale, SaleItem, Inventory, Batch, User, Product
from datetime import datetime, timedelta
import random

def seed():
    db = SessionLocal()
    try:
        store_id = 1
        # Staff members of Store 1
        staff_ids = [3, 4] # pharmacist01, associate01
        
        # 1. Clear existing transfers and sales for Store 1 (optional, for clean demo)
        print("Cleaning up existing Store 1 dummy data...")
        # Delete SaleItems first to avoid FK constraint error
        sale_ids = [s.id for s in db.query(Sale).filter(Sale.store_id == store_id).all()]
        if sale_ids:
            db.query(SaleItem).filter(SaleItem.sale_id.in_(sale_ids)).delete(synchronize_session=False)
            db.query(Sale).filter(Sale.id.in_(sale_ids)).delete(synchronize_session=False)
        
        db.query(StockTransfer).filter((StockTransfer.from_store_id == store_id) | (StockTransfer.to_store_id == store_id)).delete(synchronize_session=False)
        
        # 2. Add some replenishment transfers
        print("Seeding diverse Transfers...")
        inventory_items = db.query(Inventory).filter(Inventory.store_id == store_id).limit(10).all()
        if not inventory_items:
            print("No inventory for Store 1. Please run main seeder first.")
            return

        for i, item in enumerate(inventory_items[:5]):
            status = ["pending", "received", "approved", "shipped"][i % 4]
            t = StockTransfer(
                from_store_id=random.choice([2, 3]), 
                to_store_id=store_id,
                product_id=item.product_id,
                quantity=random.randint(20, 100),
                status=status
            )
            db.add(t)

        # 3. Add 15-20 Sales for Store 1, distributed across staff
        print("Seeding Sales distributed by Staff...")
        customers = ["Arun Kumar", "Priya Singh", "Sameer Khan", "Rahul Gupta", "Anita Roy", "Vikram Shah", "Kiran Devi"]
        
        for i in range(20):
            # Distribution over the last 7 days
            sale_time = datetime.now() - timedelta(days=random.randint(0, 6), hours=random.randint(1, 15))
            staff_id = random.choice(staff_ids)
            
            new_sale = Sale(
                store_id=store_id,
                associate_id=staff_id,
                total_amount=random.uniform(150, 2500),
                customer_name=random.choice(customers),
                customer_mobile=f"98765{random.randint(11111, 99999)}",
                payment_method=random.choice(["cash", "card", "upi"]),
                status="completed",
                created_at=sale_time
            )
            db.add(new_sale)
            db.flush()
            
            # Add sale items
            batches = db.query(Batch).join(Inventory).filter(Inventory.store_id == store_id).limit(3).all()
            for b in random.sample(batches, k=random.randint(1, 2)):
                qty = random.randint(1, 10)
                item = SaleItem(
                    sale_id=new_sale.id,
                    batch_id=b.id,
                    quantity=qty,
                    unit_price=b.selling_price,
                    subtotal=b.selling_price * qty
                )
                db.add(item)

        # 4. Trigger "Low Stock" and "Expiring" alerts for Analytics
        print("Mocking Stock Health issues...")
        # Make some batches low stock
        reorder_items = db.query(Batch).join(Inventory).filter(Inventory.store_id == store_id).limit(3).all()
        for b in reorder_items:
            b.current_quantity = random.randint(1, 5) # below reorder_level
            
        # Make a batch expiring soon
        expiring_batch = db.query(Batch).join(Inventory).filter(Inventory.store_id == store_id).offset(3).first()
        if expiring_batch:
            expiring_batch.expiry_date = (datetime.now() + timedelta(days=15)).date()

        db.commit()
        print("Successfully seeded all Supervisor operational data!")
        
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
