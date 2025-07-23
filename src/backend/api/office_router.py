from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.collection import Collection
from .database import db
from .auth_deps import current_user
from pydantic import BaseModel, conint

router = APIRouter(prefix="/office", tags=["office"])


def get_office_col() -> Collection:
    return db["office_days"]


def monday_forward(d: date) -> date:
    wd = d.weekday()
    if wd == 6:
        return d + timedelta(days=1)
    return d - timedelta(days=wd)


def business_week(start: date):
    return [start + timedelta(days=i) for i in range(5)]


@router.get("/week")
def get_week(start: date = Query(...), user=Depends(current_user), col: Collection = Depends(get_office_col)):
    base = monday_forward(date.today())
    start = monday_forward(start)
    max_allowed = base + timedelta(weeks=3)
    if start < base or start >= max_allowed:
        raise HTTPException(400, "Semana fora do intervalo permitido")
    days = []
    for d in business_week(start):
        iso = d.isoformat()
        doc = col.find_one({"date": iso})
        if not doc:
            doc = {
                "date": iso,
                "capacity": 8,
                "bookings": []
            }
            col.insert_one(doc)
        mine = any(b["user_id"] == str(user["_id"]) for b in doc["bookings"])
        days.append({
            "date": doc["date"],
            "capacity": doc["capacity"],
            "bookings": doc["bookings"],
            "bookedByMe": mine
        })
    return {"days": days}


class BookReq(BaseModel):
    date: date


@router.post("/book")
def book_day(body: BookReq, user=Depends(current_user), col: Collection = Depends(get_office_col)):
    day_iso = body.date.isoformat()
    doc = col.find_one({"date": day_iso})
    if not doc:
        raise HTTPException(404, "Day not found")
    if any(b["user_id"] == user["_id"] for b in doc["bookings"]):
        raise HTTPException(409, "Already booked")
    if len(doc["bookings"]) >= doc["capacity"]:
        raise HTTPException(409, "Full")

    col.update_one(
        {"date": day_iso},
        {"$push": {
            "bookings": {"user_id": user["_id"], "username": user["username"], "ts": datetime.utcnow().isoformat()}}}
    )
    return {"ok": True}


@router.delete("/book/{day}")
def cancel_book(day: date, user=Depends(current_user), col: Collection = Depends(get_office_col)):
    col.update_one({"date": day.isoformat()}, {"$pull": {"bookings": {"user_id": user["_id"]}}})
    return {"ok": True}


class CapacityReq(BaseModel):
    capacity: conint(gt=0, le=50)


@router.patch("/day/{day}/capacity")
def set_capacity(day: date,
                 body: CapacityReq,
                 user=Depends(current_user),
                 col: Collection = Depends(get_office_col)):
    if user.get("type") != "admin":
        raise HTTPException(403, "Forbidden")

    doc = col.find_one({"date": day.isoformat()})
    if not doc:
        raise HTTPException(404, "Day not found")

    if len(doc["bookings"]) > body.capacity:
        raise HTTPException(409, "Capacidade inferior às reservas atuais")

    col.update_one({"date": day.isoformat()}, {"$set": {"capacity": body.capacity}})
    return {"ok": True}


@router.delete("/day/{day}/user/{uid}")
def remove_user(day: date,
                uid: str,
                user=Depends(current_user),
                col: Collection = Depends(get_office_col)):
    if user.get("type") != "admin":
        raise HTTPException(403, "Forbidden")

    col.update_one(
        {"date": day.isoformat()},
        {"$pull": {"bookings": {"user_id": uid}}}
    )
    return {"ok": True}
