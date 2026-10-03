const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000";

export type NoteStatus =
  | "QUEUED"
  | "TRANSCRIBING"
  | "SUMMARIZING"
  | "COMPLETED"
  | "FAILED";

export interface NoteListItem {
  id: string;
  original_filename: string;
  language_code: string;
  status: NoteStatus;
  progress: number;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface AudioNote extends NoteListItem {
  storage_path: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  gnani_job_id: string | null;
  transcript: string | null;
  summary: string | null;
}

export async function getNotes(): Promise<NoteListItem[]> {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load audio notes.");
  }

  const data = await response.json();

  return data.notes;
}

export async function getNote(
  noteId: string,
): Promise<AudioNote> {
  const response = await fetch(
    `${API_BASE_URL}/notes/${noteId}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Could not load audio note.");
  }

  return response.json();
}

export async function uploadAudio(
  file: File,
  languageCode: string,
): Promise<AudioNote> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("language_code", languageCode);

  const response = await fetch(
    `${API_BASE_URL}/uploads`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ?? "Audio upload failed.",
    );
  }

  return data.note;
}