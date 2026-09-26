from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import users, meetings, participants, auth

# Create tables if they don't already exist (seed.py is the primary
# way to set up + populate the DB, but this makes `uvicorn app.main:app`
# safe to run standalone too).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Workplace Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(meetings.router)
app.include_router(participants.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Zoom Workplace Clone API"}
