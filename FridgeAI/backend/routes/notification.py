from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from models import Inventory

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):

    notifications = []

    today = date.today()

    inventory = (
        db.query(Inventory)
        .filter(Inventory.user_id == user_id)
        .all()
    )

    for item in inventory:

        # Low stock
        if item.quantity <= 2:

            notifications.append({
                "type": "warning",
                "title": f"{item.item_name} is running low",
                "message": f"Only {item.quantity} {item.unit} left."
            })

        # Out of stock
        if item.quantity == 0:

            notifications.append({
                "type": "danger",
                "title": f"{item.item_name} finished",
                "message": "Add it to your shopping list."
            })

        # Expiry
        if item.expiry_date:

            days = (item.expiry_date - today).days

            if days == 0:

                notifications.append({
                    "type": "danger",
                    "title": f"{item.item_name} expires today",
                    "message": "Use it today."
                })

            elif days == 1:

                notifications.append({
                    "type": "warning",
                    "title": f"{item.item_name} expires tomorrow",
                    "message": "Use it soon."
                })

            elif days <= 3:

                notifications.append({
                    "type": "info",
                    "title": f"{item.item_name} expires in {days} days",
                    "message": "Plan meals using this ingredient."
                })

    return notifications