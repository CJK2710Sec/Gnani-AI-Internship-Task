from app.core.config import (
    SUPABASE_STORAGE_BUCKET,
    SUPABASE_URL,
)
from app.services.supabase_client import supabase


def upload_audio_to_storage(
    storage_path: str,
    file_bytes: bytes,
    content_type: str,
) -> None:
    supabase.storage.from_(
        SUPABASE_STORAGE_BUCKET
    ).upload(
        path=storage_path,
        file=file_bytes,
        file_options={
            "content-type": content_type,
            "upsert": "false",
        },
    )


def delete_audio_from_storage(
    storage_path: str,
) -> None:
    supabase.storage.from_(
        SUPABASE_STORAGE_BUCKET
    ).remove([storage_path])


def create_audio_signed_url(
    storage_path: str,
    expires_in: int = 3600,
) -> str:
    response = (
        supabase.storage
        .from_(SUPABASE_STORAGE_BUCKET)
        .create_signed_url(
            storage_path,
            expires_in,
        )
    )

    if not isinstance(response, dict):
        raise RuntimeError(
            "Unexpected Supabase signed URL response."
        )

    signed_url = (
        response.get("signedURL")
        or response.get("signedUrl")
        or response.get("signed_url")
    )

    if not signed_url:
        raise RuntimeError(
            "Supabase did not return a signed URL."
        )

    # Some client versions may return a relative URL.
    if signed_url.startswith("/"):
        signed_url = (
            f"{SUPABASE_URL}/storage/v1"
            f"{signed_url}"
        )

    return signed_url