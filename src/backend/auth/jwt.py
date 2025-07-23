from datetime import datetime, timedelta
import jwt, os
from fastapi import HTTPException

SECRET = os.getenv("JWT_SECRET")
ALGO   = "HS256"
ACCESS_MIN = 30
REFRESH_DAYS = 7

def create_token(sub: str, exp_minutes: int):
    payload = {"sub": sub, "exp": datetime.utcnow() + timedelta(minutes=exp_minutes)}
    return jwt.encode(payload, SECRET, algorithm=ALGO)

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid/expired token")
