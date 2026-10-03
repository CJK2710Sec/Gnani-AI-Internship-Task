import os

from dotenv import load_dotenv


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv(
    "SUPABASE_STORAGE_BUCKET",
    "audio-notes",
)


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is not configured")

if not SUPABASE_SERVICE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_KEY is not configured")

if not SUPABASE_STORAGE_BUCKET:
    raise RuntimeError("SUPABASE_STORAGE_BUCKET is not configured")

WORKER_POLL_SECONDS = int(
    os.getenv("WORKER_POLL_SECONDS", "3")
)

GNANI_API_KEY = os.getenv("GNANI_API_KEY")

GNANI_BASE_URL = os.getenv(
    "GNANI_BASE_URL",
    "https://api.vachana.ai",
)

GNANI_LANGUAGE_CODE = os.getenv(
    "GNANI_LANGUAGE_CODE",
    "en-IN",
)


if not GNANI_API_KEY:
    raise RuntimeError("GNANI_API_KEY is not configured")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL")


if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not configured")

if not GROQ_MODEL:
    raise RuntimeError("GROQ_MODEL is not configured")