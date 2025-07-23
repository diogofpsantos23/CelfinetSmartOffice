import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(".env.docker")
from .database import db
from .auth_router import router as auth_router
from .office_router import router as office_router
from .notes_router import router as notes_router

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "OK"}


@app.on_event("startup")
def seed():
    from .office_seed import seed_office_days
    seed_office_days(db["office_days"], capacity=8)


app.include_router(auth_router)
app.include_router(office_router)
app.include_router(notes_router)
