from typing import Any

import requests

from app.core.config import (
    GNANI_API_KEY,
    GNANI_BASE_URL,
)


class GnaniAPIError(Exception):
    pass


def _headers() -> dict[str, str]:
    return {
        "X-API-Key-ID": GNANI_API_KEY,
    }


def create_transcription_job(
    audio_url: str,
    language_code: str,
) -> dict[str, Any]:
    url = f"{GNANI_BASE_URL}/stt/v3/batch/jobs"

    payload = {
        "config": {
            "model": "gnani-prisma-v2.5",
            "language_code": language_code,
            "mode": "transcribe",
            "with_diarization": False,
            "is_multi_channel": False,
            "with_denoise": False,
        },
        "source": {
            "type": "cloud_storage",
            "auth": {
                "mode": "public",
            },
            "paths": [
                audio_url,
            ],
        },
    }

    try:
        response = requests.post(
            url,
            headers={
                **_headers(),
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )

    except requests.RequestException as exc:
        raise GnaniAPIError(
            f"Could not connect to Gnani: {exc}"
        ) from exc

    if response.status_code != 201:
        raise GnaniAPIError(
            f"Gnani create job failed "
            f"({response.status_code}): "
            f"{response.text}"
        )

    data = response.json()

    if not data.get("job_id"):
        raise GnaniAPIError(
            "Gnani create response did not contain job_id."
        )

    return data


def start_transcription_job(
    job_id: str,
) -> dict[str, Any]:
    import time

    url = (
        f"{GNANI_BASE_URL}/stt/v3/batch/jobs/"
        f"{job_id}/start"
    )

    max_attempts = 4

    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.post(
                url,
                headers=_headers(),
                timeout=30,
            )

        except requests.RequestException as exc:
            raise GnaniAPIError(
                f"Could not start Gnani job: {exc}"
            ) from exc

        if response.status_code == 202:
            return response.json()

        if response.status_code == 429:
            if attempt == max_attempts:
                raise GnaniAPIError(
                    "Gnani rate limit exceeded after retries."
                )

            wait_seconds = 15 * attempt

            print(
                f"Gnani rate limited. "
                f"Retrying in {wait_seconds} seconds..."
            )

            time.sleep(wait_seconds)
            continue

        raise GnaniAPIError(
            f"Gnani start job failed "
            f"({response.status_code}): "
            f"{response.text}"
        )

    raise GnaniAPIError(
        "Gnani job could not be started."
    )

TERMINAL_STATUSES = {
    "COMPLETED",
    "PARTIAL_FAILURE",
    "FAILED",
    "START_FAILED",
    "CANCELLED",
}


def get_transcription_job(
    job_id: str,
) -> dict[str, Any]:
    import time

    url = (
        f"{GNANI_BASE_URL}/stt/v3/batch/jobs/"
        f"{job_id}"
    )

    max_attempts = 4

    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.get(
                url,
                headers=_headers(),
                timeout=30,
            )

        except requests.RequestException as exc:
            raise GnaniAPIError(
                f"Could not get Gnani job status: {exc}"
            ) from exc

        if response.status_code == 200:
            return response.json()

        if response.status_code == 429:
            if attempt == max_attempts:
                raise GnaniAPIError(
                    "Gnani status API rate limited "
                    "after retries."
                )

            wait_seconds = 15 * attempt

            print(
                f"Gnani status rate limited. "
                f"Retrying in {wait_seconds} seconds..."
            )

            time.sleep(wait_seconds)
            continue

        raise GnaniAPIError(
            f"Gnani status request failed "
            f"({response.status_code}): "
            f"{response.text}"
        )

    raise GnaniAPIError(
        "Could not get Gnani job status."
    )


def wait_for_transcription(
    job_id: str,
    poll_seconds: int = 10,
) -> dict[str, Any]:
    import time

    while True:
        job = get_transcription_job(job_id)

        status = job.get("status")

        progress = job.get("progress") or {}

        completed = progress.get(
            "completed_files",
            0,
        )

        total = progress.get(
            "total_files",
            0,
        )

        print(
            f"Gnani status: {status} "
            f"({completed}/{total} completed)"
        )

        if status in TERMINAL_STATUSES:
            return job

        time.sleep(poll_seconds)


def get_transcript_url(
    job_id: str,
) -> str:
    import time

    url = (
        f"{GNANI_BASE_URL}/stt/v3/batch/jobs/"
        f"{job_id}/files"
    )

    max_attempts = 5

    for attempt in range(1, max_attempts + 1):
        try:
            response = requests.get(
                url,
                headers=_headers(),
                params={
                    "status": "COMPLETED",
                    "limit": 50,
                },
                timeout=30,
            )

        except requests.RequestException as exc:
            raise GnaniAPIError(
                f"Could not get Gnani job files: {exc}"
            ) from exc

        if response.status_code == 200:
            data = response.json().get("data", [])

            if not data:
                raise GnaniAPIError(
                    "Gnani returned no completed files."
                )

            transcript_url = data[0].get(
                "transcript_url"
            )

            if not transcript_url:
                raise GnaniAPIError(
                    "Gnani did not return transcript_url."
                )

            return transcript_url

        if response.status_code == 429:
            if attempt == max_attempts:
                raise GnaniAPIError(
                    "Gnani files API rate limited "
                    "after retries."
                )

            wait_seconds = 15 * attempt

            print(
                f"Gnani files API rate limited. "
                f"Retrying in {wait_seconds} seconds..."
            )

            time.sleep(wait_seconds)
            continue

        raise GnaniAPIError(
            f"Gnani files request failed "
            f"({response.status_code}): "
            f"{response.text}"
        )

    raise GnaniAPIError(
        "Could not get Gnani transcript URL."
    )


def download_transcript(
    transcript_url: str,
) -> str:
    try:
        response = requests.get(
            transcript_url,
            timeout=60,
        )

    except requests.RequestException as exc:
        raise GnaniAPIError(
            f"Could not download transcript: {exc}"
        ) from exc

    if response.status_code != 200:
        raise GnaniAPIError(
            f"Transcript download failed "
            f"({response.status_code})."
        )

    data = response.json()

    transcript = data.get(
        "full_transcript"
    )

    if not transcript:
        raise GnaniAPIError(
            "Transcript JSON did not contain "
            "full_transcript."
        )

    return transcript