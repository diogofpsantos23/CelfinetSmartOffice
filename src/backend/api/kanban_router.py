from datetime import date, timedelta, datetime, time
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.collection import Collection
from .database import db
from .auth_deps import current_user
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId

from .auth_deps import current_user, get_users_collection

router = APIRouter(prefix="/kanban", tags=["kanban"])

class KanbanItem(BaseModel):
    id: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=500)
    status: str = Field(..., pattern="^(todo|inprogress|done)$")
    date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))

    @field_validator("date")
    def validate_date(cls, v):
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("date must be in YYYY-MM-DD format")

@router.get("/")
def list_kanban(user=Depends(current_user), users=Depends(get_users_collection)):
    doc = users.find_one({"_id": ObjectId(user["_id"])}, {"kanban": 1, "_id": 0})
    return {"kanban": doc.get("kanban", [])}

@router.put("/add")
def add_card(body: KanbanItem, user=Depends(current_user), users=Depends(get_users_collection)):
    kanban_card = body.model_dump()
    users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$push": {"kanban": kanban_card}}  
    )
    return {"success": True, "kanban": kanban_card}

@router.post("/modify")
def modify_card(body: KanbanItem, user=Depends(current_user), users=Depends(get_users_collection)):
    kanban_card = body.model_dump()
    
    result = users.update_one(
        {
            "_id": ObjectId(user["_id"]),
            "kanban.id": kanban_card["id"]
        },
        {
            "$set": {
                "kanban.$": kanban_card
            }
        }
    )
    
    return {
        "success": result.modified_count > 0,
        "kanban": kanban_card
    }

@router.delete("/{id}")
def delete_kanban(id: str, user=Depends(current_user), users=Depends(get_users_collection)):
    res = users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$pull": {"kanban": {"id": id}}}
    )
    if res.modified_count == 0:
        raise HTTPException(404, "Card não encontrado")
    return {"ok": True}