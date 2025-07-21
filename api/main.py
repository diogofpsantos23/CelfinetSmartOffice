from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app=FastAPI()

ENV = os.getenv("ENV", "dev")

if ENV == "prod":
    allowed_origins = [os.getenv("ALLOWED_ORIGIN")]
else:
    allowed_origins = ["http://localhost:7070"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origins],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)

if __name__=="__main__":
    host = os.getenv("HOST")
    port = int(os.getenv("PORT"))

    uvicorn.run("api.main:app", host=host, port=port, reload=True)

