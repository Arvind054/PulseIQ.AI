import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Project } from "@/src/DB/models/projectSchema";
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
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-lg border border-[color:var(--card-border)] bg-card p-8 text-center">
          <h1 className="text-lg font-semibold">Project not found</h1>
          <p className="mt-2 text-sm text-muted">
            This project may have been deleted or you don&apos;t have access.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const project: ProjectDetails = {
    _id: String(projectRaw._id),
    name: String(projectRaw.name),
    description: projectRaw.description ? String(projectRaw.description) : "",
    apiKey: String(projectRaw.apiKey),
    createdAt: projectRaw.createdAt ? new Date(projectRaw.createdAt as string | Date).toISOString() : "",
    updatedAt: projectRaw.updatedAt ? new Date(projectRaw.updatedAt as string | Date).toISOString() : "",
  };

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <WorkspaceClient project={project} />
      </div>
    </div>
  );
}
