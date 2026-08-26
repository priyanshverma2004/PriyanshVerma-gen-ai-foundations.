from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UpdateProfile

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# ------------------------
# Get User Profile
# ------------------------

@router.get("/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
    "id": user.id,
    "name": user.name,
    "email": user.email,
    "phone": user.phone,
    "bio": user.bio,
    "profile_image": user.profile_image,

    "diet_type": user.diet_type,
    "cuisine": user.cuisine,
    "spice_level": user.spice_level,
    "servings": user.servings,
    "allergy": user.allergy,
    "health_goal": user.health_goal,

    "favorite_foods": user.favorite_foods,
    "avoid_foods": user.avoid_foods,
    "cooking_style": user.cooking_style,
    "meal_time": user.meal_time,
    "budget": user.budget
}

# ------------------------
# Update Profile
# -# ------------------------
# Update Profile
# ------------------------

@router.put("/{user_id}")
def update_profile(
    user_id: int,
    profile: UpdateProfile,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Basic Profile
    user.name = profile.name
    user.phone = profile.phone
    user.bio = profile.bio

    # Preferences
    user.diet_type = profile.diet_type
    user.cuisine = profile.cuisine
    user.spice_level = profile.spice_level
    user.servings = profile.servings
    user.allergy = profile.allergy
    user.health_goal = profile.health_goal

    user.favorite_foods = profile.favorite_foods
    user.avoid_foods = profile.avoid_foods
    user.cooking_style = profile.cooking_style
    user.meal_time = profile.meal_time
    user.budget = profile.budget

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile Updated Successfully",
       "user": {

    "id": user.id,
    "name": user.name,
    "email": user.email,
    "phone": user.phone,
    "bio": user.bio,
    "profile_image": user.profile_image,

    "diet_type": user.diet_type,
    "cuisine": user.cuisine,
    "spice_level": user.spice_level,
    "servings": user.servings,
    "allergy": user.allergy,
    "health_goal": user.health_goal,

    "favorite_foods": user.favorite_foods,
    "avoid_foods": user.avoid_foods,
    "cooking_style": user.cooking_style,
    "meal_time": user.meal_time,
    "budget": user.budget

}
    }