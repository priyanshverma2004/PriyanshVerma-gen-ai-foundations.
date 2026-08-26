from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from database import get_db
from models import Shopping
from schemas import ShoppingCreate

router = APIRouter(
    prefix="/shopping",
    tags=["Shopping"]
)


@router.get("/{user_id}")
def get_shopping(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Shopping)
        .filter(Shopping.user_id == user_id)
        .all()
    )


@router.post("/")
def add_shopping(item: ShoppingCreate, db: Session = Depends(get_db)):

    shopping = Shopping(
        user_id=item.user_id,
        name=item.name,
        category=item.category,
        quantity=item.quantity,
        unit=item.unit,
        checked=False
    )

    db.add(shopping)
    db.commit()
    db.refresh(shopping)

    return shopping
@router.put("/{shopping_id}/quantity")
def update_quantity(
    shopping_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):

    item = db.query(Shopping).filter(
        Shopping.id == shopping_id
    ).first()

    if not item:
        raise HTTPException(404, "Item not found")

    item.quantity = quantity

    db.commit()

    db.refresh(item)

    return item
@router.delete("/{shopping_id}")
def delete_shopping(shopping_id: int, db: Session = Depends(get_db)):

    item = db.query(Shopping).filter(
        Shopping.id == shopping_id
    ).first()

    if not item:
        raise HTTPException(404, "Item not found")

    db.delete(item)
    db.commit()

    return {"message": "Deleted"}