import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Project } from "@/src/DB/models/projectSchema";
import { Navbar } from "@/app/components/navbar";
import { WorkspaceClient } from "./workspace-client";

type ProjectDetails = {
  _id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt?: string;
  updatedAt?: string;
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

  const projectRaw = await Project.findById(id).lean();

  if (!projectRaw) {
    return (
      <div className="min-h-screen bg-[var(--background)] px-4 pb-10 pt-24 text-[var(--foreground)] sm:px-6 lg:px-8 lg:pt-28">
        <Navbar />
        <div className="relative mx-auto max-w-lg rounded-[28px] border border-[color:var(--card-border)] bg-[var(--card)] p-8 text-center shadow-lg">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-555">
            Project not found
          </p>
          <h1 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">
            We could not locate this project workspace.
          </h1>
          <p className="mt-2 text-xs text-[color:var(--muted)] leading-relaxed">
            The project might have been permanently deleted or is registered under separate credit identities.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-700 shadow active:scale-95"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Hydrate object safely for client serialization
  const project: ProjectDetails = {
    _id: String(projectRaw._id),
    name: String(projectRaw.name),
    description: projectRaw.description ? String(projectRaw.description) : "",
    apiKey: String(projectRaw.apiKey),
    createdAt: projectRaw.createdAt ? new Date(projectRaw.createdAt as string | Date).toISOString() : "",
    updatedAt: projectRaw.updatedAt ? new Date(projectRaw.updatedAt as string | Date).toISOString() : "",
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] px-4 pb-10 pt-24 text-[var(--foreground)] sm:px-6 lg:px-8 lg:pt-28">
      {/* Background patterns */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 dark:opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 glow-orb opacity-35 dark:opacity-40" />

      <Navbar />
      <WorkspaceClient project={project} />
    </div>
  );
}
