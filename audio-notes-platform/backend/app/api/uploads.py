from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.services.storage import (
    delete_audio_from_storage,
    upload_audio_to_storage,
)
from app.services.supabase_client import supabase


router = APIRouter(
    prefix="/uploads",
    tags=["uploads"],
)


ALLOWED_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".mp4",
    ".flac",
    ".ogg",
    ".opus",
    ".m4a",
    ".aac",
    ".webm",
    ".amr",
}

SUPPORTED_LANGUAGES = {
    "bn-IN",
    "en-IN",
    "hi-IN",
    "kn-IN",
    "ml-IN",
    "mr-IN",
    "ta-IN",
    "te-IN",
}


@router.post("")
def upload_audio(file: UploadFile = File(...),
                 language_code: str = Form("en-IN"),):
    original_filename = Path(file.filename or "").name

    if language_code not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported language for Gnani Batch STT.",
        )
    if not original_filename:
        raise HTTPException(
            status_code=400,
            detail="File name is missing.",
        )

    extension = Path(original_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {extension}",
        )

    file_bytes = file.file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    note_id = str(uuid4())

    # We keep the user's original filename in PostgreSQL,
    # but use a predictable safe filename inside Storage.
    storage_path = (
        f"audio/{note_id}/original{extension}"
    )

    content_type = (
        file.content_type or "application/octet-stream"
    )

    storage_uploaded = False

    try:
        upload_audio_to_storage(
            storage_path=storage_path,
            file_bytes=file_bytes,
            content_type=content_type,
        )

        storage_uploaded = True

        response = (
            supabase
            .table("audio_notes")
            .insert(
                {
                    "id": note_id,
                    "original_filename": original_filename,
                    "storage_path": storage_path,
                    "mime_type": content_type,
                    "file_size_bytes": len(file_bytes),
                    "language_code": language_code,
                    "status": "QUEUED",
                    "progress": 10,
                }
            )
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Database did not return the created audio note."
            )

        return {
            "message": "Audio uploaded successfully.",
            "note": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as exc:
        # Prevent orphan files if DB insertion fails
        # after Storage upload succeeded.
        if storage_uploaded:
            try:
                delete_audio_from_storage(storage_path)
            except Exception:
                pass

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {exc}",
        ) from exc

    finally:
        file.file.close()