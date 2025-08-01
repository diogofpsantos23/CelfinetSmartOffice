from datetime import datetime, timedelta
import os, jwt
from bson import ObjectId
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo.collection import Collection
from .database import db

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGO   = "HS256"
ACCESS_MIN = 60
REFRESH_DAYS = 7

security = HTTPBearer(auto_error=False)

def get_users_collection() -> Collection:
    return db[os.getenv("USERS_COLLECTION_NAME")]

def get_moodBoard_collection() -> Collection:
    return db[os.getenv("MOODBOARD_COLLECTION")]

def create_token(sub: str, minutes: int) -> str:
    payload = {"sub": sub, "exp": datetime.utcnow() + timedelta(minutes=minutes)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

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
