import time

from app.services.jobs import (
    claim_note,
    get_next_summarizing_note,
    get_next_work_note,
    mark_note_failed,
    save_gnani_job_id,
    save_summary_and_complete,
    save_transcript,
    update_progress,
)

from app.core.config import WORKER_POLL_SECONDS

from app.services.gnani import (
    create_transcription_job,
    download_transcript,
    get_transcription_job,
    get_transcript_url,
    start_transcription_job,
    wait_for_transcription,
)

from app.services.jobs import (
    claim_note,
    get_next_work_note,
    mark_note_failed,
    save_gnani_job_id,
    save_transcript,
    update_progress,
)

from app.services.storage import (
    create_audio_signed_url,
)

from app.services.summarizer import (
    summarize_transcript,
)

def process_note(note: dict) -> None:
    note_id = note["id"]
    filename = note["original_filename"]
    storage_path = note["storage_path"]
    local_status = note["status"]
    language_code = note["language_code"]

    gnani_job_id = note.get(
        "gnani_job_id"
    )

    print(
        f"Processing: {filename}"
    )

    try:
        # A new upload first needs to be claimed.
        if local_status == "QUEUED":
            claimed = claim_note(note_id)

            if claimed is None:
                print(
                    f"Job {note_id} was already claimed."
                )
                return

        # Create a Gnani job only when one
        # does not already exist.
        if not gnani_job_id:
            print(
                "Creating signed audio URL..."
            )

            audio_url = create_audio_signed_url(
                storage_path
            )

            print(
                "Creating Gnani batch job..."
            )

            created_job = (
                create_transcription_job(
                    audio_url,
                    language_code,
                )
            )

            gnani_job_id = (
                created_job["job_id"]
            )

            save_gnani_job_id(
                note_id,
                gnani_job_id,
            )

            print(
                f"Gnani job created: "
                f"{gnani_job_id}"
            )

        else:
            print(
                f"Resuming Gnani job: "
                f"{gnani_job_id}"
            )

        # Check the actual external state.
        remote_job = get_transcription_job(
            gnani_job_id
        )

        remote_status = remote_job.get(
            "status"
        )

        print(
            f"Current Gnani status: "
            f"{remote_status}"
        )

        # If Create succeeded earlier but Start
        # never succeeded, start it now.
        if remote_status == "CREATED":
            print(
                "Starting Gnani batch job..."
            )

            start_result = (
                start_transcription_job(
                    gnani_job_id
                )
            )

            update_progress(
                note_id,
                35,
            )

            print(
                "Gnani job started successfully."
            )

            print(
                f"Gnani status: "
                f"{start_result.get('status')}"
            )

        if remote_status in {
            "COMPLETED",
            "PARTIAL_FAILURE",
            "FAILED",
            "START_FAILED",
            "CANCELLED",
        }:
            final_job = remote_job

        else:
            print(
                "Waiting for transcription..."
            )

            final_job = wait_for_transcription(
                gnani_job_id
            )

        final_status = final_job.get(
            "status"
        )

        if final_status not in {
            "COMPLETED",
            "PARTIAL_FAILURE",
        }:
            reason = (
                final_job.get("cancel_reason")
                or f"Gnani job ended with "
                f"status {final_status}"
            )

            raise RuntimeError(reason)

        print(
            "Transcription completed."
        )

        print(
            "Fetching transcript URL..."
        )

        transcript_url = (
            get_transcript_url(
                gnani_job_id
            )
        )

        print(
            "Downloading transcript..."
        )

        transcript = download_transcript(
            transcript_url
        )

        save_transcript(
            note_id,
            transcript,
        )

        print(
            "Transcript saved to PostgreSQL."
        )

        print(
            f"Transcript preview: "
            f"{transcript[:150]}"
        )

        print(
            "Step 6 complete."
        )

    except Exception as exc:
        error_message = str(exc)

        print(
            f"Processing failed: "
            f"{error_message}"
        )

        mark_note_failed(
            note_id,
            error_message,
        )


def summarize_note(note: dict) -> None:
    note_id = note["id"]
    filename = note["original_filename"]
    transcript = note.get("transcript")

    print(
        f"Summarizing: {filename}"
    )

    try:
        if not transcript:
            raise RuntimeError(
                "Cannot summarize an empty transcript."
            )

        summary = summarize_transcript(
            transcript
        )

        save_summary_and_complete(
            note_id,
            summary,
        )

        print(
            "Summary saved successfully."
        )

        print(
            f"Summary preview: "
            f"{summary[:200]}"
        )

        print(
            "Audio note completed."
        )

    except Exception as exc:
        error_message = str(exc)

        print(
            f"Summarization failed: "
            f"{error_message}"
        )

        mark_note_failed(
            note_id,
            error_message,
        )

def main() -> None:
    print(
        "Background worker started."
    )

    while True:
        try:
            transcription_note = (
                get_next_work_note()
            )

            if transcription_note:
                process_note(
                    transcription_note
                )

            else:
                summary_note = (
                    get_next_summarizing_note()
                )

                if summary_note:
                    summarize_note(
                        summary_note
                    )

                else:
                    print(
                        "No background jobs found."
                    )

        except Exception as exc:
            print(
                f"Worker error: {exc}"
            )

        time.sleep(
            WORKER_POLL_SECONDS
        )


if __name__ == "__main__":
    main()