"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getNotes,
  NoteListItem,
  uploadAudio,
} from "@/lib/api";


const LANGUAGES = [
  { code: "en-IN", name: "English" },
  { code: "hi-IN", name: "Hindi" },
  { code: "bn-IN", name: "Bengali" },
  { code: "kn-IN", name: "Kannada" },
  { code: "ml-IN", name: "Malayalam" },
  { code: "mr-IN", name: "Marathi" },
  { code: "ta-IN", name: "Tamil" },
  { code: "te-IN", name: "Telugu" },
];


function statusStyles(status: NoteListItem["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "FAILED":
      return "bg-red-50 text-red-700 border-red-200";

    case "TRANSCRIBING":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "SUMMARIZING":
      return "bg-violet-50 text-violet-700 border-violet-200";

    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}


function statusLabel(status: NoteListItem["status"]) {
  switch (status) {
    case "QUEUED":
      return "Queued";

    case "TRANSCRIBING":
      return "Transcribing";

    case "SUMMARIZING":
      return "Summarizing";

    case "COMPLETED":
      return "Completed";

    case "FAILED":
      return "Failed";

    default:
      return status;
  }
}


export default function Home() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [languageCode, setLanguageCode] =
    useState("en-IN");

  const [notes, setNotes] =
    useState<NoteListItem[]>([]);

  const [loadingNotes, setLoadingNotes] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  async function loadNotes() {
    try {
      setError(null);

      const data = await getNotes();

      setNotes(data);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load notes.",
      );

    } finally {
      setLoadingNotes(false);
    }
  }


  useEffect(() => {
    loadNotes();
  }, []);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!file) {
      setError("Please select an audio file.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const note = await uploadAudio(
        file,
        languageCode,
      );

      router.push(`/notes/${note.id}`);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed.",
      );

    } finally {
      setUploading(false);
    }
  }


  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>
            <p className="text-lg font-bold tracking-tight">
              Audio Notes
            </p>

            <p className="text-xs text-slate-500">
              Gnani ASR + AI Summaries
            </p>
          </div>

          <Link
            href="/architecture"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Architecture
          </Link>

        </div>
      </div>


      <div className="mx-auto max-w-6xl px-6 py-12">

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">

          <div>
            <div className="mb-8">

              <div className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Audio intelligence workspace
              </div>

              <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Turn long audio into
                transcripts and concise notes
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Upload an audio recording, choose the spoken
                language, and let the platform handle
                transcription and summarization in the
                background.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  01 Upload
                </span>

                <span className="text-slate-300">
                  →
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  02 Transcribe
                </span>

                <span className="text-slate-300">
                  →
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  03 Summarize
                </span>

              </div>

            </div>

          </div>


          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                Upload audio
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Select a supported audio file and the language
                spoken in the recording.
              </p>
            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Audio file
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40">

                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    ↑
                  </div>

                  <p className="font-medium text-slate-800">
                    Choose audio file
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    MP3, WAV, M4A, FLAC, OGG, WEBM and more
                  </p>

                  <input
                    type="file"
                    accept=".wav,.mp3,.mp4,.flac,.ogg,.opus,.m4a,.aac,.webm,.amr"
                    onChange={(event) => {
                      setFile(
                        event.target.files?.[0] ?? null,
                      );
                    }}
                    className="hidden"
                  />

                </label>

                {file && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

              </div>


              <div>
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Audio language
                </label>

                <select
                  id="language"
                  value={languageCode}
                  onChange={(event) =>
                    setLanguageCode(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {LANGUAGES.map((language) => (
                    <option
                      key={language.code}
                      value={language.code}
                    >
                      {language.name} ({language.code})
                    </option>
                  ))}
                </select>

              </div>


              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}


              <button
                type="submit"
                disabled={uploading}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload and process"}
              </button>

            </form>

          </section>

        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">

          <FeatureCard
            title="Batch transcription"
            text="Process long recordings asynchronously using Gnani Batch STT without blocking the upload request."
          />

          <FeatureCard
            title="AI-powered summaries"
            text="Convert completed transcripts into concise, useful notes using Groq."
          />

          <FeatureCard
            title="Background processing"
            text="Track each recording through queued, transcription, summarization, and completion states."
          />

        </section>

        <section className="mt-16">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-2xl font-semibold">
                Recent uploads
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Open any note to view processing progress,
                transcript, and summary.
              </p>
            </div>

            <button
              onClick={loadNotes}
              className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:self-auto"
            >
              Refresh
            </button>

          </div>


          {loadingNotes ? (

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading uploads...
            </div>

          ) : notes.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <p className="font-medium text-slate-700">
                No uploads yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Your processed audio notes will appear here.
              </p>

            </div>

          ) : (

            <div className="grid gap-4">

              {notes.map((note) => (

                <Link
                  href={`/notes/${note.id}`}
                  key={note.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800">
                        {note.original_filename}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">

                        <span>
                          {note.language_code}
                        </span>

                        <span>•</span>

                        <span>
                          {new Date(
                            note.created_at,
                          ).toLocaleString()}
                        </span>

                      </div>

                    </div>


                    <div className="flex items-center gap-4">

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles(
                          note.status,
                        )}`}
                      >
                        {statusLabel(note.status)}
                      </span>
                      {note.status !== "COMPLETED" && (
                        <span className="text-sm font-semibold text-slate-600">
                        {note.progress}%
                      </span>
)}

                    </div>

                  </div>
                  {note.error_message && (

                    <p className="mt-3 text-sm text-red-600">
                      {note.error_message}
                    </p>

                  )}

                </Link>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}


function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-h-[130px] items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        ✦
      </div>

      <div>

        <p className="font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}