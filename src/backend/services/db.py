from pymongo import MongoClient
from dotenv import load_dotenv
import os
from typing import Optional
import json
import bcrypt
from passlib.hash import pbkdf2_sha256
from datetime import datetime

load_dotenv()


class Database:

    def __init__(self, database_url: Optional[str] = None, database_name: Optional[str] = None,
                 users_collection_name: Optional[str] = None, db_path: Optional[str] = None):
        self.database_url = database_url if database_url is not None else os.getenv("DATABASE_URL")
        self.database_name = database_name if database_name is not None else os.getenv("DB_NAME")
        self.users_collection_name = users_collection_name if users_collection_name is not None else os.getenv(
            "USERS_COLLECTION_NAME")
        self.db_path = db_path if db_path is not None else os.getenv("DATABASE_PATH")
        self.client = MongoClient(self.database_url)
        self.db = self.client[self.database_name]
        self.users_collection = self.db[self.users_collection_name]

    # INITIALIZATION METHODS

    def populate(self):
        self.drop()

        with open(self.db_path, "r") as f:
            data = json.load(f)

        default_pw = "celfinet123"

        inserted_ids = []
        for u in data:
            doc = {
                "username": u["username"],
                "type": u.get("type", "user"),
                "password": bcrypt.hashpw(default_pw.encode("utf-8"), bcrypt.gensalt()).decode(),
                "createdAt": datetime.utcnow()
            }
            res = self.users_collection.insert_one(doc)
            inserted_ids.append(res.inserted_id)

        return inserted_ids

    def is_initialized(self):
        return self.users_collection.estimated_document_count() > 0

    def drop(self):
        self.users_collection.delete_many({})

