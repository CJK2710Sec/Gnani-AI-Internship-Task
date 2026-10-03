"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AudioNote,
  getNote,
} from "@/lib/api";


const TERMINAL_STATUSES = [
  "COMPLETED",
  "FAILED",
];


function statusStyles(status: AudioNote["status"]) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";

    case "TRANSCRIBING":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "SUMMARIZING":
      return "border-violet-200 bg-violet-50 text-violet-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}


function statusLabel(status: AudioNote["status"]) {
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


function formatFileSize(
  bytes: number | null,
) {
  if (!bytes) {
    return "Unknown size";
  }

  const mb = bytes / 1024 / 1024;

  return `${mb.toFixed(2)} MB`;
}


export default function NotePage() {
  const params = useParams();

  const noteId = params.id as string;

  const [note, setNote] =
    useState<AudioNote | null>(null);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    let timer:
      | ReturnType<typeof setTimeout>
      | undefined;

    async function loadNote() {
      try {
        const data = await getNote(noteId);

        setNote(data);
        setError(null);

        if (
          !TERMINAL_STATUSES.includes(
            data.status,
          )
        ) {
          timer = setTimeout(
            loadNote,
            2500,
          );
        }

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load note.",
        );
      }
    }

    loadNote();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [noteId]);


  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">

        <TopBar />

        <div className="mx-auto max-w-5xl px-6 py-12">

          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            ← Back to uploads
          </Link>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

            <p className="font-semibold text-red-800">
              Unable to load this audio note
            </p>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error}
            </p>

          </div>

        </div>

      </main>
    );
  }


  if (!note) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">

        <TopBar />

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-indigo-100" />

            <p className="mt-4 text-sm text-slate-500">
              Loading audio note...
            </p>

          </div>

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <TopBar />

      <div className="mx-auto max-w-6xl px-6 py-10">

        <div className="mb-6">

          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
          >
            ← Back to uploads
          </Link>

        </div>


        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-7 sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0">

                <div className="mb-3 flex flex-wrap items-center gap-3">

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles(
                      note.status,
                    )}`}
                  >
                    {statusLabel(note.status)}
                  </span>

                  <span className="text-xs text-slate-400">
                    {note.language_code}
                  </span>

                </div>


                <h1 className="max-w-3xl break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {note.original_filename}
                </h1>


                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">

                  <span>
                    Uploaded{" "}
                    {new Date(
                      note.created_at,
                    ).toLocaleString()}
                  </span>

                  <span>
                    {formatFileSize(
                      note.file_size_bytes,
                    )}
                  </span>

                  {note.mime_type && (
                    <span>
                      {note.mime_type}
                    </span>
                  )}

                </div>

              </div>


              <div className="rounded-2xl bg-slate-50 px-5 py-4">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Processing
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {note.progress}%
                </p>

              </div>

            </div>

          </div>


          <div className="p-7 sm:p-8">

            <div className="mb-3 flex items-center justify-between">

              <p className="text-sm font-medium text-slate-700">
                Processing progress
              </p>

              <p className="text-sm font-semibold text-slate-600">
                {note.progress}%
              </p>

            </div>


            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                style={{
                  width: `${note.progress}%`,
                }}
              />

            </div>


            <div className="mt-6 grid gap-3 sm:grid-cols-4">

              <PipelineStep
                title="Uploaded"
                active={note.progress >= 10}
                number="1"
              />

              <PipelineStep
                title="Transcription"
                active={note.progress >= 20}
                number="2"
              />

              <PipelineStep
                title="Summary"
                active={note.progress >= 70}
                number="3"
              />

              <PipelineStep
                title="Complete"
                active={note.status === "COMPLETED"}
                number="4"
              />

            </div>


            {note.status === "QUEUED" && (
              <ProcessingMessage
                title="Waiting for processing"
                text="Your audio has been uploaded successfully and is waiting for the background worker."
              />
            )}


            {note.status === "TRANSCRIBING" && (
              <ProcessingMessage
                title="Transcribing audio"
                text="Gnani Batch STT is processing the recording. You can leave this page and return later."
              />
            )}


            {note.status === "SUMMARIZING" && (
              <ProcessingMessage
                title="Generating AI summary"
                text="The transcript is ready. Groq is now converting it into a concise summary."
              />
            )}


            {note.status === "COMPLETED" && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">

                <p className="font-semibold text-emerald-800">
                  Processing complete
                </p>

                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  Your transcript and AI summary are ready below.
                </p>

              </div>
            )}


            {note.status === "FAILED" && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

                <p className="font-semibold text-red-800">
                  Processing failed
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {note.error_message ??
                    "An unexpected processing error occurred."}
                </p>

                {note.transcript && (
                  <p className="mt-3 text-sm font-medium text-red-700">
                    The transcript was preserved and is still available below.
                  </p>
                )}

              </div>
            )}

          </div>

        </section>


        {(note.summary || note.transcript) && (

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

            {note.summary && (

              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                    ✦
                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      AI generated
                    </p>

                    <h2 className="text-xl font-bold text-slate-900">
                      Summary
                    </h2>

                  </div>

                </div>


                <div className="mt-6 border-t border-slate-100 pt-6">

                  <p className="whitespace-pre-wrap leading-7 text-slate-700">
                    {note.summary}
                  </p>

                </div>

              </section>

            )}


            {note.transcript && (

              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                    ≡
                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Gnani ASR
                    </p>

                    <h2 className="text-xl font-bold text-slate-900">
                      Transcript
                    </h2>

                  </div>

                </div>


                <div className="mt-6 max-h-[650px] overflow-y-auto border-t border-slate-100 pt-6">

                  <p className="whitespace-pre-wrap leading-8 text-slate-700">
                    {note.transcript}
                  </p>

                </div>

              </section>

            )}

          </div>

        )}


        {!note.transcript &&
          !note.summary &&
          note.status !== "FAILED" && (

            <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                ✦
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Results will appear here
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                The page automatically checks for processing
                updates. Your transcript and summary will
                appear as soon as they are ready.
              </p>

            </section>

          )}

      </div>

    </main>
  );
}


function TopBar() {
  return (
    <div className="border-b border-slate-200 bg-white">

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <Link
          href="/"
          className="transition hover:opacity-80"
        >

          <p className="text-lg font-bold tracking-tight">
            Audio Notes
          </p>

          <p className="text-xs text-slate-500">
            Gnani ASR + AI Summaries
          </p>

        </Link>


        <Link
          href="/architecture"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Architecture
        </Link>

      </div>

    </div>
  );
}


function PipelineStep({
  title,
  active,
  number,
}: {
  title: string;
  active: boolean;
  number: string;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 transition ${
        active
          ? "border-indigo-200 bg-indigo-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
            active
              ? "bg-indigo-600 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {active ? "✓" : number}
        </div>

        <span
          className={`text-sm font-medium ${
            active
              ? "text-indigo-700"
              : "text-slate-500"
          }`}
        >
          {title}
        </span>

      </div>

    </div>
  );
}


function ProcessingMessage({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-5 py-4">

      <div className="flex gap-4">

        <div className="mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-indigo-500" />

        <div>

          <p className="font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}