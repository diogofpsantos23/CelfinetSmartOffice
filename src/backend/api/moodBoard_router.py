from datetime import date, timedelta, datetime, time
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.collection import Collection
from .database import db
from .auth_deps import current_user
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId
import uuid

from .auth_deps import current_user, get_users_collection, get_moodBoard_collection
from .database import db

router = APIRouter(prefix="/moodBoard", tags=["moodBoard"])


class MoodBoardItem(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    class_id: str = Field(..., min_length=1)
    emoji_id: str = Field(..., min_length=1, max_length=50)
    moodTopics: list[str] = Field(..., min_items=1)
    note: str = Field(..., min_length=1, max_length=500)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


@router.get("/")
def list_moodItems(user=Depends(current_user), users=Depends(get_users_collection)):
    doc = users.find_one(
        {"_id": ObjectId(user["_id"])}, 
        {"moods": 1, "_id": 0}
        )
    return {"moods": doc.get("moods", [])}


@router.put("/add")
def add_mood(body: MoodBoardItem, user=Depends(current_user), users=Depends(get_users_collection)):
    mood_item = body.model_dump()
    users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$push": {"moods": mood_item}}  
    )
    return {"success": True, "mood": mood_item}

@router.post("/modify")
def modify_card(body: MoodBoardItem, user=Depends(current_user), users=Depends(get_users_collection)):
    mood_item = body.model_dump()
    
    result = users.update_one(
        {
            "_id": ObjectId(user["_id"]),
            "moods.id": mood_item["id"]
        },
        {
            "$set": {
                "moods.$": mood_item
            }
        }
    )
    
    return {
        "success": result.modified_count > 0,
        "mood": mood_item
    }

@router.delete("/{id}")
def delete_mood(id: str, user=Depends(current_user), users=Depends(get_users_collection)):
    res = users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$pull": {"moods": {"id": id}}}
    )
    if res.modified_count == 0:
        raise HTTPException(404, "Mood não encontrado")
    return {"ok": True}


@router.get("/allMoods")
def get_all_moods(user=Depends(current_user), moodboard=Depends(get_moodBoard_collection)):
    ids = ["strong_negative", "mild_negative", "positive", "neutral", "moodTopics"]

    docs_cursor = moodboard.find({"_id": {"$in": ids}})
    docs = list(docs_cursor)

    # Separate mood categories and topics
    mood_categories = [d for d in docs if d["_id"] != "moodTopics"]
    mood_topics = next((d for d in docs if d["_id"] == "moodTopics"), {})

    return {
        "mood_categories": mood_categories,
        "mood_topics": mood_topics
    }