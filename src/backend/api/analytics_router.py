from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException
from pymongo.collection import Collection
from .database import db
from .auth_deps import current_user
from zoneinfo import ZoneInfo
from time import time

router = APIRouter(prefix="/analytics", tags=["analytics"])
PT_TZ = ZoneInfo("Europe/Lisbon")
CACHE_TTL = 600
_cache = {"ts": 0, "payload": None}

def get_office_col() -> Collection:
    return db["office_days"]

@router.get("/weekday-averages")
def get_weekday_averages(user=Depends(current_user), col: Collection = Depends(get_office_col)):
    if user.get("type") != "admin":
        raise HTTPException(403, "Forbidden")
    now_ts = time()
    if _cache["payload"] and now_ts - _cache["ts"] < CACHE_TTL:
        return _cache["payload"]
    today_pt = datetime.now(PT_TZ).date()
    end_date = today_pt - timedelta(days=1)
    earliest_doc = col.find_one({}, sort=[("date", 1)])
    weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    if not earliest_doc:
        averages = [{"weekday": w, "average": 0, "samples": 0} for w in weekday_names]
        payload = {"since": None, "to": end_date.isoformat(), "weekdayAverages": averages}
        _cache.update(ts=now_ts, payload=payload)
        return payload
    try:
        start_date = date.fromisoformat(earliest_doc["date"])
    except Exception:
        raise HTTPException(500, "Invalid date format in data")
    if start_date > end_date:
        averages = [{"weekday": w, "average": 0, "samples": 0} for w in weekday_names]
        payload = {"since": start_date.isoformat(), "to": end_date.isoformat(), "weekdayAverages": averages}
        _cache.update(ts=now_ts, payload=payload)
        return payload
    cursor = col.find({"date": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()}})
    booking_counts = {d["date"]: len(d.get("bookings", [])) for d in cursor}
    totals = [0] * 5
    occurrences = [0] * 5
    current = start_date
    while current <= end_date:
        wd = current.weekday()
        if wd < 5:
            occurrences[wd] += 1
            totals[wd] += booking_counts.get(current.isoformat(), 0)
        current += timedelta(days=1)
    averages = []
    for i in range(5):
        avg = 0 if occurrences[i] == 0 else round(totals[i] / occurrences[i], 2)
        averages.append({"weekday": weekday_names[i], "average": avg, "samples": occurrences[i]})
    payload = {"since": start_date.isoformat(), "to": end_date.isoformat(), "weekdayAverages": averages}
    _cache.update(ts=now_ts, payload=payload)
    return payload
