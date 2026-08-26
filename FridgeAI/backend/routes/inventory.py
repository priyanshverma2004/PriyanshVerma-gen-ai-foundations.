from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory
from schemas import InventoryCreate
from typing import List
from pydantic import BaseModel
router = APIRouter(prefix="/inventory", tags=["Inventory"])


# -----------------------------
# Get all inventory
# -----------------------------
@router.get("/")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()

class InventoryItem(BaseModel):
    item_name: str
    quantity: float
    unit: str
    category: str
    expiry_date: str | None = None


class InventorySave(BaseModel):
    user_id: int
    items: List[InventoryItem]

@router.post("/save")
def save_inventory(
    data: InventorySave,
    db: Session = Depends(get_db)
):

    for item in data.items:

        inventory = Inventory(
            user_id=data.user_id,
            item_name=item.item_name,
            quantity=item.quantity,
            unit=item.unit,
            category=item.category,
            expiry_date=item.expiry_date,
            image=None,
        )

        db.add(inventory)

    db.commit()

    return {
        "message": "Inventory Saved Successfully"
    }
# -----------------------------
# Get inventory for one user
# -----------------------------
@router.get("/user/{user_id}")
def get_user_inventory(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Inventory)
        .filter(Inventory.user_id == user_id)
        .all()
    )


# -----------------------------
# Add Item
# -----------------------------
@router.post("/")
def add_inventory(item: InventoryCreate, db: Session = Depends(get_db)):

    new_item = Inventory(
        user_id=item.user_id,
        item_name=item.item_name,
        quantity=item.quantity,
        unit=item.unit,
        category=item.category,
        expiry_date=item.expiry_date,
        image=item.image,
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


# -----------------------------
# Update Item
# -----------------------------
@router.put("/{item_id}")
def update_inventory(
    item_id: int,
    item: InventoryCreate,
    db: Session = Depends(get_db)
):

    inventory_item = (
        db.query(Inventory)
        .filter(Inventory.id == item_id)
        .first()
    )

    if not inventory_item:
        raise HTTPException(status_code=404, detail="Item not found")

    inventory_item.item_name = item.item_name
    inventory_item.quantity = item.quantity
    inventory_item.unit = item.unit
    inventory_item.category = item.category
    inventory_item.expiry_date = item.expiry_date
    inventory_item.image = item.image

    db.commit()
    db.refresh(inventory_item)

    return inventory_item


# -----------------------------
# Delete Item
# -----------------------------
@router.delete("/{item_id}")
def delete_inventory(item_id: int, db: Session = Depends(get_db)):

    inventory_item = (
        db.query(Inventory)
        .filter(Inventory.id == item_id)
        .first()
    )

    if not inventory_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(inventory_item)
    db.commit()

    return {
        "message": "Item deleted successfully"
    }