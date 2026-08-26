from datetime import date
from pydantic import BaseModel


# ---------- Inventory ----------

class InventoryCreate(BaseModel):
    user_id: int
    item_name: str
    quantity: float
    unit: str
    category: str
    expiry_date: date | None = None
    image: str | None = None


class InventoryResponse(BaseModel):
    id: int
    user_id: int
    item_name: str
    quantity: float
    unit: str
    category: str
    expiry_date: date | None = None
    image: str | None = None

    class Config:
        from_attributes = True

from pydantic import BaseModel, EmailStr


# -------------------------
# User Signup
# -------------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# -------------------------
# User Login
# -------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------
# Login Response
# -------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

from pydantic import BaseModel

class UpdateProfile(BaseModel):
    name: str
    phone: str | None = None
    bio: str | None = None


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    bio: str | None = None

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional


class UpdateProfile(BaseModel):
    name: str
    phone: str | None = None
    bio: str | None = None

    diet_type: str | None = None
    cuisine: str | None = None
    spice_level: str | None = None
    servings: int = 2
    allergy: str | None = None
    health_goal: str | None = None

    favorite_foods: str | None = None
    avoid_foods: str | None = None
    cooking_style: str | None = None
    meal_time: str | None = None
    budget: str | None = None



# -------------------------
# Shopping Schemas
# -------------------------

class ShoppingCreate(BaseModel):
    user_id: int
    name: str
    category: str
    quantity: int = 1
    unit: str = "pcs"


class ShoppingUpdate(BaseModel):
    checked: bool


class ShoppingResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    quantity: int
    unit: str
    checked: bool

    class Config:
        from_attributes = True