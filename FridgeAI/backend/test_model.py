from database import SessionLocal
from models import User, Inventory

db = SessionLocal()

users = db.query(User).all()

print(users)

db.close()