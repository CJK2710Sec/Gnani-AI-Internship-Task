# Audio Notes Platform

Take-home assignment for Gnani AI.

The application allows users to upload long-form audio,
transcribe it asynchronously using Gnani Batch STT,
generate an AI summary using Groq, and reopen previous
uploads.

## Live Application

https://gnani-ai-internship-task.vercel.app/

## Tech Stack

- Next.js
- FastAPI
- PostgreSQL / Supabase
- Supabase Storage
- Python background worker
- Gnani Batch STT
- Groq LLM

## Processing Flow

Upload audio
→ FastAPI validation
→ Supabase Storage
→ PostgreSQL record
→ Background worker
→ Gnani Batch STT
→ Save transcript
→ Groq summarization
→ Save summary
→ Display results

## Project Structure

audio-notes-platform/
├── frontend/
└── backend/

## Architecture

The deployed application contains a detailed architecture
page at:

https://gnani-ai-internship-task.vercel.app/architecture

## Repository

https://github.com/CJK2710Sec/Gnani-AI-Internship-Task