from fastapi import APIRouter, HTTPException

from app.services.supabase_client import supabase


router = APIRouter(
    prefix="/notes",
    tags=["notes"],
)


@router.get("")
def list_notes():
    try:
        response = (
            supabase
            .table("audio_notes")
            .select(
                "id, original_filename, language_code, status, progress, "
                "created_at, completed_at, error_message"
            )
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return {
            "notes": response.data
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load notes: {exc}",
        ) from exc


@router.get("/{note_id}")
def get_note(note_id: str):
    try:
        response = (
            supabase
            .table("audio_notes")
            .select("*")
            .eq("id", note_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Audio note not found.",
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load note: {exc}",
        ) from exc