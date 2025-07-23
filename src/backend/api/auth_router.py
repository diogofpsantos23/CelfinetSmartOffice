from fastapi import APIRouter, Depends, HTTPException
from pymongo.collection import Collection
import bcrypt

from .auth_deps import (
    create_token,
    verify_token,
    get_users_collection,
    current_user,
    ACCESS_MIN,
    REFRESH_DAYS,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(body: dict, users: Collection = Depends(get_users_collection)):
    username = body.get("username", "")
    password = body.get("password", "")

    user = users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=401, detail="Bad credentials")

    stored = user.get("password", "")
    if isinstance(stored, str):
        stored = stored.encode()

    if not bcrypt.checkpw(password.encode(), stored):
        raise HTTPException(status_code=401, detail="Bad credentials")

    access = create_token(str(user["_id"]), ACCESS_MIN)
    refresh = create_token(str(user["_id"]), REFRESH_DAYS * 24 * 60)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "username": user["username"],
        "type": user.get("type", "user"),
    }


@router.post("/refresh")
def refresh(body: dict):
    tok = body.get("refresh_token")
    if not tok:
        raise HTTPException(status_code=401, detail="No refresh token")
    payload = verify_token(tok)
    access = create_token(payload["sub"], ACCESS_MIN)
    return {"access_token": access}


@router.get("/me")
def me(user=Depends(current_user)):
    return user


@router.post("/logout")
def logout():
    return {"ok": True}



