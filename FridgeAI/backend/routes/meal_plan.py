from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from database import get_db
from models import Inventory
from services.groq_service import generate_meal_plan

router = APIRouter(prefix="/meal-plan", tags=["Meal Plan"])


class MealPlanRequest(BaseModel):
    user_id: int
    days: int = 5


@router.post("/")
def create_meal_plan(
    req: MealPlanRequest,
    db: Session = Depends(get_db)
):

    # Get user's inventory
    inventory = (
        db.query(Inventory)
        .filter(Inventory.user_id == req.user_id)
        .all()
    )

    if not inventory:
        return {
            "success": False,
            "message": "No inventory found."
        }

    # Ask Groq to generate meal plan
    response = generate_meal_plan(
        inventory=inventory,
        days=req.days
    )

    # Convert JSON string returned by Groq into Python object
    try:

        response = response.strip()

# Remove markdown code block if Groq returns it
        if response.startswith("```json"):
            response = response.replace("```json", "").replace("```", "").strip()

        elif response.startswith("```"):
            response = response.replace("```", "").strip()

        meal_plan = json.loads(response)

        return {
            "success": True,
            "meal_plan": meal_plan
        }

    except Exception:

        return {
            "success": False,
            "message": "Groq returned invalid JSON.",
            "raw": response
        }