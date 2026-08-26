from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Text,
    ForeignKey,
    Numeric,
    Boolean
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False)

    password = Column(String(255), nullable=False)

    phone = Column(String(20), nullable=True)
    diet_type = Column(String(50), nullable=True)

    cuisine = Column(String(100), nullable=True)

    spice_level = Column(String(20), nullable=True)

    servings = Column(Integer, default=2)

    allergy = Column(Text, nullable=True)

    health_goal = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    favorite_foods = Column(Text)

    avoid_foods = Column(Text)

    cooking_style = Column(String(50))

    meal_time = Column(String(50))

    budget = Column(String(30))
    profile_image = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    inventory = relationship("Inventory", back_populates="user")
    shopping = relationship("Shopping",back_populates="user")
class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    item_name = Column(String(100), nullable=False)
    quantity = Column(Numeric(10, 2))
    unit = Column(String(20))
    category = Column(String(50))
    expiry_date = Column(Date)
    image = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="inventory")

class ChatHistory(Base):

    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id")
    )

    role = Column(String(20))

    message = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
class Conversation(Base):

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String(255), default="New Chat")

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())
class Shopping(Base):
    __tablename__ = "shopping"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer,ForeignKey("users.id"))

    name = Column(String)

    category = Column(String)

    quantity = Column(Integer, default=1)

    unit = Column(String, default="pcs")

    checked = Column(Boolean, default=False)
    user = relationship("User",back_populates="shopping")