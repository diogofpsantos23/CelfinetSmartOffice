from fastapi import APIRouter, Query, Depends, Request, HTTPException
from services.db import Database
from typing import Optional
from scripts.initialize_services import db_instance
from datetime import timedelta
import json


router=APIRouter()

# Define a dependency to get the database instance
def get_db():
    return db_instance


#Routes sâo aqui