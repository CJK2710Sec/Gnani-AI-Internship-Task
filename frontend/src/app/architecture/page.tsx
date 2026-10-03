import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const GITHUB_REPO_URL =
  "https://github.com/CJK2710Sec/Gnani-AI-Internship-Task";

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopBar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
            System Design
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            How the Audio Notes platform works
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            The application keeps uploads responsive by separating
            short HTTP work from long-running transcription and
            summarization.
          </p>
        </header>

        {/* High-level architecture */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <SectionHeading
            eyebrow="System overview"
            title="High-level architecture"
            description="The browser communicates only with FastAPI. Long-running work is handled by a background worker."
          />

          <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            <FlowCard title="Frontend" text="Next.js" />
            <Arrow />
            <FlowCard title="API" text="FastAPI" />
            <Arrow />
            <FlowCard title="Database" text="PostgreSQL" />
            <Arrow />
            <FlowCard title="Worker" text="Python worker" />
          </div>

          <div className="my-3 flex justify-center text-xl text-slate-300 dark:text-slate-700">
            ↓
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            <FlowCard title="ASR" text="Gnani Batch STT" />
            <Arrow />
            <FlowCard title="Transcript" text="Saved in DB" />
            <Arrow />
            <FlowCard title="Summary" text="Groq LLM" />
            <Arrow />
            <FlowCard title="Result" text="Displayed in UI" />
          </div>
        </section>

        {/* Upload lifecycle */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <SectionHeading
            eyebrow="Request lifecycle"
            title="What happens after a user uploads audio?"
            description="The upload request finishes quickly. Transcription and summarization continue independently in the background."
          />

          <div className="mt-7 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            <LifecycleCard
              number="01"
              title="Upload"
              text="Audio + language"
            />

            <Arrow />

            <LifecycleCard
              number="02"
              title="Validate"
              text="FastAPI checks input"
            />

            <Arrow />

            <LifecycleCard
              number="03"
              title="Store"
              text="Audio → Supabase"
            />

            <Arrow />

            <LifecycleCard
              number="04"
              title="Queue"
              text="DB status = QUEUED"
            />
          </div>

          <div className="my-3 flex justify-center text-xl text-slate-300 dark:text-slate-700">
            ↓
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            <LifecycleCard
              number="05"
              title="Transcribe"
              text="Gnani Batch STT"
            />

            <Arrow />

            <LifecycleCard
              number="06"
              title="Persist"
              text="Save transcript"
            />

            <Arrow />

            <LifecycleCard
              number="07"
              title="Summarize"
              text="Groq LLM"
            />

            <Arrow />

            <LifecycleCard
              number="08"
              title="Complete"
              text="Show transcript + summary"
            />
          </div>
        </section>

        {/* Data + long audio + progress */}
        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <InfoCard
            eyebrow="Storage"
            title="Where files live"
          >
            Original audio is stored in a private Supabase
            Storage bucket under a UUID-based path.
            PostgreSQL stores the filename, storage path,
            language, status, transcript, summary and errors.
          </InfoCard>

          <InfoCard
            eyebrow="Long audio"
            title="Why Batch STT"
          >
            Long recordings are handled asynchronously using
            Gnani Batch STT. The worker creates the job, starts
            it, polls its status and retrieves the completed
            transcript.
          </InfoCard>

          <InfoCard
            eyebrow="Progress"
            title="How status is shown"
          >
            PostgreSQL is the source of truth. The frontend
            periodically reads the note state from FastAPI and
            shows queued, transcribing, summarizing, completed
            or failed states.
          </InfoCard>
        </section>

        {/* Sync vs background */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <SectionHeading
            eyebrow="Execution Model"
            title="Synchronous vs Background Work"
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <WorkCard
              title="Synchronous"
              subtitle="Runs during the upload request"
              items={[
                "Validate audio format and language",
                "Upload audio to object storage",
                "Create the PostgreSQL record",
                "Return the note ID to the frontend",
              ]}
            />

            <WorkCard
              title="Background"
              subtitle="Runs independently in the Worker"
              items={[
                "Create or resume the Gnani job",
                "Start and poll transcription",
                "Download and Save the Transcript",
                "Generate the Groq Summary",
                "Update final status and progress",
              ]}
            />
          </div>
        </section>

        {/* Reliability, security and future improvements */}
        <section className="mt-8 grid gap-5 md:grid-cols-2">

          <InfoCard
            eyebrow="Reliability"
            title="Resilient Processing"
          >
            Processing failures are stored in PostgreSQL so the UI can
            clearly show failed jobs. Gnani job IDs are persisted, allowing
            interrupted work to resume without creating unnecessary duplicate
            transcription jobs.
          </InfoCard>


          <InfoCard
            eyebrow="Security"
            title="Private by Design"
          >
            Audio files remain inside a private Supabase Storage bucket.
            Gnani receives temporary signed access only when transcription is
            required, while service credentials stay entirely on the backend.
          </InfoCard>


          <InfoCard
            eyebrow="Future Improvement"
            title="Scale Background Processing"
          >
            Introduce Celery and Redis with multiple workers for controlled
            parallel processing, together with atomic job claiming to prevent
            multiple workers from processing the same note.
          </InfoCard>


          <InfoCard
            eyebrow="Future Improvement"
            title="Handle Larger Workloads"
          >
            Upload very large audio files directly from the browser to object
            storage using signed upload URLs, and use chunked or hierarchical
            summarization for extremely long transcripts.
          </InfoCard>

        </section>
        

        {/* Repository */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Source code
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Project Repository
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Frontend, Backend, Background Worker and system
                architecture are available on GitHub.
              </p>
            </div>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              View GitHub repository →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="transition hover:opacity-80"
        >
          <p className="text-lg font-bold tracking-tight">
            Audio Notes
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gnani ASR + AI Summaries
          </p>
        </Link>

        <div className="flex items-center gap-3">

          <ThemeToggle />
          
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            GitHub
          </a>

          <Link
            href="/"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function FlowCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}

function LifecycleCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
        {number}
      </div>

      <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden text-center text-xl text-slate-300 dark:text-slate-700 lg:block">
      →
    </div>
  );
}

function InfoCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>

      <div className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
        {children}
      </div>
    </div>
  );
}

function WorkCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-400"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}