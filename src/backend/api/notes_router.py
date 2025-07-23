# api/notes_router.py
from datetime import datetime, date, time as dtime
from typing import Optional
from pydantic import BaseModel, Field, validator
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
import uuid

from .auth_deps import current_user, get_users_collection

router = APIRouter(prefix="/notes", tags=["notes"])

class NoteIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    date: Optional[str] = None   # "YYYY-MM-DD" ou ""
    time: Optional[str] = None   # "HH:MM" ou ""

    @validator("date", "time", pre=True)
    def empty_to_none(cls, v):
        return None if v in ("", None) else v

    @validator("date")
    def validate_date(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("date must be YYYY-MM-DD")

    @validator("time")
    def validate_time(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, "%H:%M")
            return v
        except ValueError:
            raise ValueError("time must be HH:MM")

    def to_iso(self) -> Optional[str]:
        if self.date is None and self.time is None:
            return None
        # default hora = 00:00 se só há data
        if self.time is None:
            d = datetime.strptime(self.date, "%Y-%m-%d").date()
            return datetime.combine(d, dtime.min).isoformat()

        # ambos
        d = datetime.strptime(self.date, "%Y-%m-%d").date() if self.date else datetime.utcnow().date()
        h, m = map(int, self.time.split(":"))
        return datetime.combine(d, dtime(hour=h, minute=m)).isoformat()

@router.get("/")
def list_notes(user=Depends(current_user), users=Depends(get_users_collection)):
    doc = users.find_one({"_id": ObjectId(user["_id"])}, {"notes": 1, "_id": 0})
    return {"notes": doc.get("notes", [])}

@router.post("/")
def add_note(body: NoteIn, user=Depends(current_user), users=Depends(get_users_collection)):
    note = {
        "id": str(uuid.uuid4()),
        "text": body.text,
    }
    when_iso = body.to_iso()
    if when_iso:
        note["when"] = when_iso
        note["date"] = body.date
        note["time"] = body.time

    users.update_one({"_id": ObjectId(user["_id"])}, {"$push": {"notes": note}})
    return {"ok": True, "note": note}

@router.delete("/{note_id}")
def delete_note(note_id: str, user=Depends(current_user), users=Depends(get_users_collection)):
    res = users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$pull": {"notes": {"id": note_id}}}
    )
    if res.modified_count == 0:
        raise HTTPException(404, "Nota não encontrada")
    return {"ok": True}
