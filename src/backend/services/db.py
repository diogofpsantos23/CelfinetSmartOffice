from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os, json, bcrypt
from datetime import datetime
from typing import Optional
import certifi

load_dotenv()


class Database:
    def __init__(self,
                 database_url: Optional[str] = None,
                 database_name: Optional[str] = None,
                 users_collection_name: Optional[str] = None,
                 db_path: Optional[str] = None):
        self.database_url = database_url or os.getenv("DATABASE_URL")
        self.database_name = database_name or os.getenv("DB_NAME")
        self.users_collection_name = users_collection_name or os.getenv("USERS_COLLECTION_NAME")
        self.db_path = db_path or os.getenv("DATABASE_PATH")
        self.client = MongoClient(
            self.database_url,
            server_api=ServerApi("1"),
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=10000
        )
        self.db = self.client[self.database_name]
        self.users_collection = self.db[self.users_collection_name]

    # INITIALIZATION METHODS
    def populate(self):
        """Apaga e reimporta utilizadores do JSON local (apenas dev)."""
        self.drop()

        if not self.db_path or not os.path.exists(self.db_path):
            raise FileNotFoundError(f"DB_PATH não encontrado: {self.db_path}")

        with open(self.db_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        default_pw = "celfinet123"
        inserted_ids = []

        for u in data:
            doc = {
                "username": u["username"],
                "type": u.get("type", "user"),
                "password": bcrypt.hashpw(default_pw.encode("utf-8"), bcrypt.gensalt()).decode(),
                "createdAt": datetime.utcnow(),
                "notes": u.get("notes", [])  # caso queiras iniciar com notas
            }
            res = self.users_collection.insert_one(doc)
            inserted_ids.append(res.inserted_id)

        return inserted_ids

    def is_initialized(self):
        return self.users_collection.estimated_document_count() > 0

    def drop(self):
        self.users_collection.delete_many({})
