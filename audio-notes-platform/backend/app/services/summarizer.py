import requests

from app.core.config import (
    GROQ_API_KEY,
    GROQ_MODEL,
)


class SummarizationError(Exception):
    pass


def summarize_transcript(
    transcript: str,
) -> str:
    if not transcript.strip():
        raise SummarizationError(
            "Transcript is empty."
        )

    url = (
        "https://api.groq.com/openai/v1/"
        "chat/completions"
    )

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You summarize audio transcripts. "
                    "Create a clear, concise summary that "
                    "captures the main ideas and important "
                    "details. Do not invent information that "
                    "is not present in the transcript."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Summarize the following audio transcript:\n\n"
                    f"{transcript}"
                ),
            },
        ],
        "temperature": 0.2,
    }

    try:
        response = requests.post(
            url,
            headers={
                "Authorization": (
                    f"Bearer {GROQ_API_KEY}"
                ),
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )

    except requests.RequestException as exc:
        raise SummarizationError(
            f"Could not connect to Groq: {exc}"
        ) from exc

    if response.status_code != 200:
        raise SummarizationError(
            f"Groq request failed "
            f"({response.status_code}): "
            f"{response.text}"
        )

    data = response.json()

    try:
        summary = (
            data["choices"][0]["message"]["content"]
        )

    except (
        KeyError,
        IndexError,
        TypeError,
    ) as exc:
        raise SummarizationError(
            "Groq returned an unexpected response."
        ) from exc

    summary = summary.strip()

    if not summary:
        raise SummarizationError(
            "Groq returned an empty summary."
        )

    return summary