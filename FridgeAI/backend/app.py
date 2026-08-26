from fastapi import FastAPI
from routes.chat import router
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from routes.inventory import router as inventory_router
from routes.notification import router as notification_router
from routes.meal_plan import router as meal_router
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from routes import conversation
from routes.scan import router as scan_router
from routes.shopping import router as shopping_router
from routes.chat import router
from database import Base, engine
from routes.inventory import router as inventory_router
Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(inventory_router)
app.include_router(meal_router)
app.include_router(notification_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(conversation.router)
app.include_router(scan_router)
app.include_router(shopping_router)