import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Project } from "@/src/DB/models/projectSchema";
import { Navbar } from "@/app/components/navbar";
import { LogsPanel } from "./logs-panel";

function formatDate(value?: Date | string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type ProjectDetails = {
  _id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  await connectDB();

  const project = (await Project.findById(id).lean()) as ProjectDetails | null;

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-4 pb-10 pt-24 text-[var(--foreground)] sm:px-6 lg:px-8 lg:pt-28">
        <Navbar />
        <div className="mx-auto max-w-4xl rounded-[24px] border border-[color:var(--card-border)] bg-[var(--card)] p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--accent)]">
            Project not found
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
            We could not find this project.
          </h1>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 pb-10 pt-24 text-[var(--foreground)] sm:px-6 lg:px-8 lg:pt-28">
      <Navbar />
      <div className="mx-auto max-w-5xl rounded-[28px] border border-[color:var(--card-border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-[color:var(--card-border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--accent)]">
              Project workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              {project.description?.trim() || "No project description has been added yet."}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-[color:var(--card-border)] bg-[color:var(--accent-dim)] p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Project overview</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-[color:var(--muted)]">Created</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[color:var(--muted)]">Last updated</p>
                <p className="mt-1 text-sm text-[var(--foreground)]">{formatDate(project.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[color:var(--muted)]">Project ID</p>
                <p className="mt-1 break-all font-mono text-sm text-[var(--foreground)]">{String(project._id)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[color:var(--card-border)] bg-[color:var(--background)] p-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">API access</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              Use this API key to connect your integrations and services.
            </p>
            <div className="mt-4 rounded-2xl border border-[color:var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                API key
              </p>
              <p className="mt-2 break-all font-mono text-sm text-[var(--foreground)]">
                {project.apiKey}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <LogsPanel projectId={String(project._id)} />
        </div>
      </div>
    </div>
  );
}
