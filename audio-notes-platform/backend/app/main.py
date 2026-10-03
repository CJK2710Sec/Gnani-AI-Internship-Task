from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.notes import router as notes_router
from app.api.uploads import router as uploads_router
from app.services.supabase_client import supabase


app = FastAPI(
    title="Audio Notes Platform API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(uploads_router)
app.include_router(notes_router)


@app.get("/")
def root():
    return {
        "message": "Audio Notes Platform API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/db-test")
def database_test():
    try:
        response = (
            supabase
            .table("audio_notes")
            .select(
                "id, original_filename, status"
            )
            .limit(1)
            .execute()
        )

        return {
            "database": "connected",
            "data": response.data,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {exc}",
        )