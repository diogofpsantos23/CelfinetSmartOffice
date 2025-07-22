import os
from datetime import datetime, timedelta
import bcrypt
import jwt
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from pymongo.collection import Collection
from services.db import Database


load_dotenv(".env.docker")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGO = "HS256"
ACCESS_MIN = 60
REFRESH_DAYS = 7

MONGO_URL = os.getenv("DATABASE_URL")
DB_NAME = os.getenv("DB_NAME")
USERS_COL = os.getenv("USERS_COLLECTION_NAME")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

def get_users_collection() -> Collection:
    return db[USERS_COL]

def create_token(sub: str, minutes: int) -> str:
    payload = {"sub": sub, "exp": datetime.utcnow() + timedelta(minutes=minutes)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

security = HTTPBearer(auto_error=False)

def current_user(credentials: HTTPAuthorizationCredentials = Depends(security),
                 users: Collection = Depends(get_users_collection)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_token(credentials.credentials)
    user = users.find_one({"_id": ObjectId(payload["sub"])}, {"password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["_id"] = str(user["_id"])
    return user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "OK", "service": "Smart Office API"}

auth = APIRouter(prefix="/auth", tags=["auth"])

@auth.post("/login")
def login(body: dict, users: Collection = Depends(get_users_collection)):
    user = users.find_one({"username": body.get("username")})
    if not user or not bcrypt.checkpw(body.get("password", "").encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Bad credentials")
    access = create_token(str(user["_id"]), ACCESS_MIN)
    refresh = create_token(str(user["_id"]), REFRESH_DAYS * 24 * 60)
    return {"access_token": access, "refresh_token": refresh, "username": user["username"], "type": user.get("type", "user")}

@auth.post("/refresh")
def refresh(body: dict):
    tok = body.get("refresh_token")
    if not tok:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = verify_token(tok)
    access = create_token(payload["sub"], ACCESS_MIN)
    return {"access_token": access}

@auth.get("/me")
def me(user=Depends(current_user)):
    return user

@auth.post("/logout")
def logout():
    return {"ok": True}

app.include_router(auth)

@app.on_event("startup")
def init_db():
    db_instance = Database()
    if not db_instance.is_initialized():
        db_instance.populate()

