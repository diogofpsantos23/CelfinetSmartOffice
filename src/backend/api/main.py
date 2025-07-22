from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

ENV = os.getenv("ENV", "dev")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", summary="Health‑check")
async def root():
    return {"status": "OK", "service": "Smart Office API"}

app.include_router(router)

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("api.main:app", host=host, port=port, reload=True)
