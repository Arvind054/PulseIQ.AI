import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Project } from "@/src/DB/models/projectSchema";
import { Navbar } from "@/app/components/navbar";
import { CreateProjectDialog } from "@/app/components/create-project-dialog";
import { DeleteProjectButton } from "@/app/components/delete-project-button";

type ProjectItem = {
  _id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

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

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const projects = (await Project.find({ ownerId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()) as ProjectItem[];

  const totalProjects = projects.length;
  const hasDescriptions = projects.filter((project) => project.description?.trim()).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <aside className="hidden w-72 shrink-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-semibold text-white">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">PulseIQ</p>
              <p className="text-sm text-slate-500">Dashboard</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <div className="rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
              My Projects
            </div>
            <div className="rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50">
              Overview
            </div>
            <div className="rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50">
              Settings
            </div>
          </div>

          <div className="mt-8">
            <CreateProjectDialog
              buttonLabel="+ Add New Project"
              buttonClassName="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            />
          </div>
        </aside>

        <main className="flex-1 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Projects</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Welcome back, {session.user.name || "there"}
              </h1>
            </div>
            <CreateProjectDialog
              buttonLabel="+ Add New Project"
              buttonClassName="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-semibold text-slate-900">{totalProjects}</p>
              <p className="mt-1 text-sm text-slate-500">Total projects</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-3xl font-semibold text-slate-900">{hasDescriptions}</p>
              <p className="mt-1 text-sm text-slate-500">Projects with details</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <h2 className="text-xl font-semibold text-slate-900">No projects yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Create your first project to start organizing incidents, insights, and AI workflows in one place.
              </p>
              <CreateProjectDialog
                buttonLabel="Create your first project"
                buttonClassName="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={String(project._id)}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
                        Active
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{project.name}</h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                      {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <p className="mt-4 min-h-20 text-sm leading-6 text-slate-600">
                    {project.description?.trim() || "No description has been added yet."}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-500">Updated {formatDate(project.updatedAt)}</p>
                    <div className="flex items-center gap-3">
                      <DeleteProjectButton
                        projectId={String(project._id)}
                        projectName={project.name}
                        buttonClassName="text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                      />
                      <Link
                        href={`/project/${project._id}`}
                        className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-800"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}