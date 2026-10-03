from typing import Any

from app.services.supabase_client import supabase

from datetime import datetime, timezone

def get_next_work_note() -> dict[str, Any] | None:
    response = (
        supabase
        .table("audio_notes")
        .select(
            "id, original_filename, storage_path, "
            "language_code,status, progress, gnani_job_id"
        )
        .in_(
            "status",
            [
                "QUEUED",
                "TRANSCRIBING",
            ],
        )
        .order("created_at")
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def claim_note(note_id: str) -> dict[str, Any] | None:
    """
    Claim a job only if it is still QUEUED.

    The second status check prevents us from blindly
    processing a note whose state has already changed.
    """

    response = (
        supabase
        .table("audio_notes")
        .update(
            {
                "status": "TRANSCRIBING",
                "progress": 20,
                "error_message": None,
            }
        )
        .eq("id", note_id)
        .eq("status", "QUEUED")
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def save_gnani_job_id(
    note_id: str,
    gnani_job_id: str,
) -> None:
    (
        supabase
        .table("audio_notes")
        .update(
            {
                "gnani_job_id": gnani_job_id,
                "progress": 30,
            }
        )
        .eq("id", note_id)
        .execute()
    )


def update_progress(
    note_id: str,
    progress: int,
) -> None:
    (
        supabase
        .table("audio_notes")
        .update(
            {
                "progress": progress,
            }
        )
        .eq("id", note_id)
        .execute()
    )


def mark_note_failed(
    note_id: str,
    error_message: str,
) -> None:
    (
        supabase
        .table("audio_notes")
        .update(
            {
                "status": "FAILED",
                "error_message": error_message,
            }
        )
        .eq("id", note_id)
        .execute()
    )

def save_transcript(
    note_id: str,
    transcript: str,
) -> None:
    (
        supabase
        .table("audio_notes")
        .update(
            {
                "transcript": transcript,
                "status": "SUMMARIZING",
                "progress": 70,
                "error_message": None,
            }
        )
        .eq("id", note_id)
        .execute()
    )

def get_next_summarizing_note() -> dict[str, Any] | None:
    response = (
        supabase
        .table("audio_notes")
        .select(
            "id, original_filename, "
            "transcript, status, progress"
        )
        .eq("status", "SUMMARIZING")
        .order("created_at")
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def save_summary_and_complete(
    note_id: str,
    summary: str,
) -> None:
    (
        supabase
        .table("audio_notes")
        .update(
            {
                "summary": summary,
                "status": "COMPLETED",
                "progress": 100,
                "error_message": None,
                "completed_at": (
                    datetime
                    .now(timezone.utc)
                    .isoformat()
                ),
            }
        )
        .eq("id", note_id)
        .execute()
    )