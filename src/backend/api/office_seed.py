from datetime import date, timedelta

def monday(d: date) -> date:
    return d - timedelta(days=d.weekday())

def business_days(start: date, weeks: int = 3):
    end = start + timedelta(days=7*weeks)
    cur = start
    while cur < end:
        if cur.weekday() < 5:
            yield cur
        cur += timedelta(days=1)

def seed_office_days(col, capacity=8):
    start = monday(date.today())
    for d in business_days(start):
        col.update_one(
            {"date": d.isoformat()},
            {"$setOnInsert": {"date": d.isoformat(), "capacity": capacity, "bookings": []}},
            upsert=True
        )
