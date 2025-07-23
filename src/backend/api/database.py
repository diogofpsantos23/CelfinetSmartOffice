import os
from pymongo import MongoClient

MONGO_URL = os.getenv("DATABASE_URL")
DB_NAME   = os.getenv("DB_NAME")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
