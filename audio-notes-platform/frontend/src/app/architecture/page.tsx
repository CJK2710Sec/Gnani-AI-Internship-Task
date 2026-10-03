import Link from "next/link";

const GITHUB_REPO_URL = "https://github.com/CJK2710Sec/Gnani-AI-Internship-Task.git";

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <TopBar />

      <div className="mx-auto max-w-6xl px-6 py-12">

        <header className="mb-12">

          <div className="mb-4 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            System Design
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            How the Audio Notes platform works
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            The platform separates fast HTTP work from
            long-running transcription and summarization so
            uploads remain responsive while processing happens
            reliably in the background.
          </p>

        </header>


        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Processing pipeline
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              High-level architecture
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Each stage has a focused responsibility and
              persists important state before moving to the
              next stage.
            </p>

          </div>


          <div className="grid gap-4 lg:grid-cols-7 lg:items-center">

            <FlowCard
              number="1"
              title="Frontend"
              text="Next.js"
            />

            <FlowArrow />

            <FlowCard
              number="2"
              title="API"
              text="FastAPI"
            />

            <FlowArrow />

            <FlowCard
              number="3"
              title="State"
              text="PostgreSQL"
            />

            <FlowArrow />

            <FlowCard
              number="4"
              title="Worker"
              text="Python"
            />

          </div>


          <div className="my-2 flex justify-center">
            <span className="text-lg text-slate-300">
              ↓
            </span>
          </div>


          <div className="grid gap-4 lg:grid-cols-7 lg:items-center">

            <FlowCard
              number="5"
              title="Transcription"
              text="Gnani Batch STT"
            />

            <FlowArrow />

            <FlowCard
              number="6"
              title="Transcript"
              text="Saved in PostgreSQL"
            />

            <FlowArrow />

            <FlowCard
              number="7"
              title="Summary"
              text="Groq LLM"
            />

            <FlowArrow />

            <FlowCard
              number="8"
              title="Result"
              text="Completed note"
            />

          </div>

          <div className="mt-7 border-t border-slate-100 pt-6">

            <div className="mb-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Design rationale
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                Why this architecture?
                </h3>

            </div>


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <ArchitectureReason
                title="Responsive API"
                text="FastAPI finishes the upload request quickly instead of waiting for transcription and summarization."
                />

                <ArchitectureReason
                title="Durable state"
                text="PostgreSQL keeps progress, external job IDs, transcripts, summaries, and errors across process restarts."
                />

                <ArchitectureReason
                title="Private audio"
                text="Files stay private in object storage and Gnani receives temporary signed access only when needed."
                />

                <ArchitectureReason
                  title="Background processing"
                  text="Long-running transcription and summarization are handled by a worker process rather than inside the FastAPI request. In the current Render deployment, that worker process shares the same service container as the API."
                />

            </div>

            </div>

        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

            <div className="mb-8">

                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Request lifecycle
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                What happens after a user uploads audio?
                </h2>

                <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                The application deliberately separates the short upload
                request from long-running speech recognition and AI
                summarization. This prevents the HTTP request from staying
                open while external APIs process the recording.
                </p>

            </div>


            <div className="space-y-5">

                <LifecycleStep
                number="01"
                title="User uploads an audio file"
                text="The Next.js frontend sends the selected audio file and language code to FastAPI. The browser only communicates with our backend and never receives Gnani, Groq, or Supabase service credentials."
                />

                <LifecycleStep
                number="02"
                title="FastAPI validates and stores the upload"
                text="FastAPI validates the audio extension and selected language. The original audio is stored in the private Supabase Storage bucket using a UUID-based path."
                />

                <LifecycleStep
                number="03"
                title="A durable database record is created"
                text="PostgreSQL receives a new audio_notes record with metadata, language, storage location, QUEUED status, and initial progress. FastAPI can now return the note ID without waiting for transcription."
                />

                <LifecycleStep
                number="04"
                title="The background worker claims the job"
                text="A separate Python worker searches PostgreSQL for queued work. The note moves into TRANSCRIBING state, keeping long-running work outside the FastAPI request process."
                />

                <LifecycleStep
                number="05"
                title="Gnani processes the recording"
                text="The worker creates a temporary signed URL for the private audio object, creates a Gnani Batch STT job, stores its external job ID, starts it, and checks its status at controlled intervals."
                />

                <LifecycleStep
                number="06"
                title="The transcript is persisted"
                text="When Gnani finishes, the worker retrieves the transcript URL, downloads the transcript, and saves the text into PostgreSQL before starting any summarization work."
                />

                <LifecycleStep
                number="07"
                title="Groq generates the summary"
                text="The saved transcript is sent to the configured Groq language model. Once a valid summary is returned, it is saved beside the transcript."
                />

                <LifecycleStep
                number="08"
                title="The frontend receives the result"
                text="The note becomes COMPLETED with 100% progress. While processing is active, the detail page periodically asks FastAPI for the current database state and automatically displays new progress, transcript, and summary data."
                />

            </div>

            </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">

          <InfoCard
            eyebrow="Storage"
            title="Where files live"
          >
            <p>
              Original audio files are stored in a private
              Supabase Storage bucket.
            </p>

            <div className="mt-4 rounded-xl bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100">
              audio/&lt;note-id&gt;/original.mp3
            </div>

            <p className="mt-4">
              Each upload gets a unique UUID-based path, while
              the original filename is stored separately in
              PostgreSQL.
            </p>
          </InfoCard>


          <InfoCard
            eyebrow="Database"
            title="Where application state lives"
          >
            <p>
              PostgreSQL stores metadata, selected language,
              progress, processing status, Gnani job ID,
              transcript, summary, timestamps, and errors.
            </p>

            <p className="mt-4">
              Because state is persisted, processing does not
              depend on the browser staying open or on
              in-memory server state.
            </p>
          </InfoCard>


          <InfoCard
            eyebrow="Long audio"
            title="Why Gnani Batch STT"
          >
            <p>
              Long audio is processed asynchronously using
              Gnani Batch STT.
            </p>

            <p className="mt-4">
              The worker creates the job, starts processing,
              polls status at controlled intervals, retrieves
              the transcript URL, and downloads the completed
              transcript.
            </p>
          </InfoCard>


          <InfoCard
            eyebrow="Progress"
            title="How the frontend tracks work"
          >
            <p>
              The frontend does not communicate directly with
              Gnani.
            </p>

            <p className="mt-4">
              It polls FastAPI for the current note state while
              PostgreSQL remains the source of truth.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <StatusRow
                label="Queued"
                value="10%"
              />

              <StatusRow
                label="Transcribing"
                value="20–50%"
              />

              <StatusRow
                label="Summarizing"
                value="70%"
              />

              <StatusRow
                label="Completed"
                value="100%"
              />
            </div>
          </InfoCard>

        </section>


        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

          <div className="mb-7">

            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Execution model
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Synchronous vs background work
            </h2>

          </div>


          <div className="grid gap-6 md:grid-cols-2">

            <WorkCard
              title="Synchronous"
              description="Short work performed during the upload request."
              items={[
                "Validate the uploaded file",
                "Validate language selection",
                "Store audio in Supabase Storage",
                "Create the database record",
                "Return the note ID to the frontend",
              ]}
            />


            <WorkCard
              title="Background"
              description="Long-running work performed by the worker."
              items={[
                "Create or resume the Gnani job",
                "Start transcription",
                "Poll Gnani status",
                "Retrieve and save the transcript",
                "Generate the Groq summary",
                "Update final status and progress",
              ]}
            />

          </div>

        </section>


        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">

          <InfoCard
            eyebrow="Queue behavior"
            title="Multiple uploads"
          >
            <p>
              Every upload is independent and receives its own
              database row, storage path, progress state, and
              external Gnani job ID.
            </p>

            <div className="mt-5 space-y-3">

              <QueueRow
                name="File A"
                status="Transcribing"
                active
              />

              <QueueRow
                name="File B"
                status="Queued"
              />

              <QueueRow
                name="File C"
                status="Queued"
              />

            </div>

            <p className="mt-5">
              The current submission uses one worker and
              processes jobs sequentially.
            </p>
          </InfoCard>


          <InfoCard
            eyebrow="Failures"
            title="Failure handling"
          >
            <p>
              Processing errors are written to PostgreSQL and
              exposed through the API so the frontend can show
              an understandable failure state.
            </p>

            <p className="mt-4">
              Temporary API rate limits are retried with
              delays.
            </p>

            <p className="mt-4">
              Gnani job IDs are saved immediately so an
              interrupted workflow can resume the same
              external job instead of creating duplicates.
            </p>

            <p className="mt-4">
              The transcript is persisted before summary
              generation, so a Groq failure does not destroy
              an already completed transcription.
            </p>
          </InfoCard>

        </section>


        <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white shadow-sm sm:p-8">

          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                Scaling
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                What I would improve next
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                The current architecture is intentionally
                simple and easy to operate for the assignment.
                These are the next changes I would make for
                larger workloads.
              </p>

            </div>


            <div className="grid gap-4 sm:grid-cols-2">

              <FutureCard
                title="Celery + Redis"
                text="Use a dedicated task queue and multiple workers for controlled parallel processing."
              />

              <FutureCard
                title="Atomic job claiming"
                text="Prevent two workers from processing the same note when worker count increases."
              />

              <FutureCard
                title="Direct browser uploads"
                text="Upload large files directly to object storage using signed upload URLs."
              />

              <FutureCard
                title="Long transcript summarization"
                text="Add chunked or hierarchical summarization for very large transcripts."
              />

              <FutureCard
                title="Retry controls"
                text="Allow users to retry transcription or summarization independently."
              />

              <FutureCard
                title="Monitoring"
                text="Add structured logs, metrics, alerting, and centralized error tracking."
              />

            </div>

          </div>

        </section>


        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Source code
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Project repository
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Full source code for the frontend, backend,
                worker, and architecture.
              </p>

            </div>


            <a
              href="https://github.com/CJK2710Sec/Gnani-AI-Internship-Task.git"
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

        

        <div className="flex items-center gap-3">

        <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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


function FlowCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">

      <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
        {number}
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}


function FlowArrow() {
  return (
    <div className="hidden text-center text-xl text-slate-300 lg:block">
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
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-900">
        {title}
      </h2>

      <div className="mt-4 leading-7 text-slate-600">
        {children}
      </div>

    </div>
  );
}


function WorkCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

      <h3 className="text-lg font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <ul className="mt-5 space-y-3">

        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-6 text-slate-600"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            <span>{item}</span>
          </li>
        ))}

      </ul>

    </div>
  );
}


function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">

      <span className="text-slate-600">
        {label}
      </span>

      <span className="font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}


function QueueRow({
  name,
  status,
  active = false,
}: {
  name: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

      <div className="flex items-center gap-3">

        <div
          className={`h-2.5 w-2.5 rounded-full ${
            active
              ? "bg-indigo-500"
              : "bg-slate-300"
          }`}
        />

        <span className="font-medium text-slate-700">
          {name}
        </span>

      </div>

      <span className="text-sm text-slate-500">
        {status}
      </span>

    </div>
  );
}


function FutureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <p className="font-semibold text-white">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>
  );
}


function LifecycleStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white">
        {number}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {text}
        </p>
      </div>

    </div>
  );
}

function ArchitectureReason({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-sm font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-600">
        {text}
      </p>

    </div>
  );
}