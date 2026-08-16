import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Project } from "@/src/DB/models/projectSchema";
import { Log } from "@/src/DB/models/logSchema";
import { Incident } from "@/src/DB/models/incidentSchemas";
import { CreateProjectDialog } from "@/app/components/create-project-dialog";
import { DeleteProjectButton } from "@/app/components/delete-project-button";
import { CopyBadge } from "@/app/components/copy-badge";

type ProjectItem = {
  _id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type ProjectStats = ProjectItem & {
  totalLogs: number;
  activeIncidents: number;
  lastLogReceived: Date | null;
  status: "healthy" | "warn" | "error" | "inactive";
  environments: string[];
  errorRate24h: number;
};

function timeAgo(dateValue?: Date | string | null) {
  if (!dateValue) return "No activity";
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const statusStyles = {
  healthy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  warn: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  error: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  inactive: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const statusLabels = {
  healthy: "Healthy",
  warn: "Warnings",
  error: "Errors",
  inactive: "Inactive",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();

  const projects = (await Project.find({ ownerId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()) as ProjectItem[];

  const projectIds = projects.map((p) => p._id);
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const projectsWithStats: ProjectStats[] = await Promise.all(
    projects.map(async (project) => {
      const totalLogs = await Log.countDocuments({ projectId: project._id });
      const activeIncidents = await Incident.countDocuments({
        projectId: project._id,
        status: { $in: ["OPEN", "INVESTIGATING"] },
      });

      const lastLog = (await Log.findOne({ projectId: project._id })
        .sort({ timestamp: -1, createdAt: -1 })
        .select("timestamp")
        .lean()) as { timestamp?: Date } | null;

      const environments = await Log.distinct("environment", { projectId: project._id });

      const errorRate24h = await Log.countDocuments({
        projectId: project._id,
        level: "ERROR",
        timestamp: { $gte: since24h },
      });

      const warnRate24h = await Log.countDocuments({
        projectId: project._id,
        level: "WARN",
        timestamp: { $gte: since24h },
      });

      let status: ProjectStats["status"] = "inactive";
      if (totalLogs > 0) {
        if (errorRate24h > 0) status = "error";
        else if (warnRate24h > 0) status = "warn";
        else status = "healthy";
      }

      return {
        ...project,
        totalLogs,
        activeIncidents,
        lastLogReceived: lastLog?.timestamp ? new Date(lastLog.timestamp) : null,
        status,
        environments: environments.filter(Boolean),
        errorRate24h,
      };
    })
  );

  const grandTotalLogs =
    projectIds.length > 0
      ? await Log.countDocuments({ projectId: { $in: projectIds } })
      : 0;
  const grandActiveIncidents =
    projectIds.length > 0
      ? await Incident.countDocuments({
          projectId: { $in: projectIds },
          status: { $in: ["OPEN", "INVESTIGATING"] },
        })
      : 0;
  const totalErrors24h =
    projectIds.length > 0
      ? await Log.countDocuments({
          projectId: { $in: projectIds },
          level: "ERROR",
          timestamp: { $gte: since24h },
        })
      : 0;

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-muted">
              {session.user.name ? `Welcome back, ${session.user.name}` : "Manage your monitored services"}
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Projects", value: projects.length },
            { label: "Total logs", value: grandTotalLogs.toLocaleString() },
            { label: "Open incidents", value: grandActiveIncidents },
            { label: "Errors (24h)", value: totalErrors24h },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-[color:var(--card-border)] bg-card p-4"
            >
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          {projectsWithStats.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[color:var(--card-border)] bg-card p-12 text-center">
              <h2 className="text-lg font-medium">No projects yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Create a project to start ingesting logs and tracking incidents across your services.
              </p>
              <div className="mt-6">
                <CreateProjectDialog label="Create your first project" />
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[color:var(--card-border)] bg-card">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-[color:var(--card-border)] px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted max-lg:hidden">
                <span>Project</span>
                <span className="w-20 text-right">Logs</span>
                <span className="w-24 text-right">Incidents</span>
                <span className="w-24 text-right">Last activity</span>
                <span className="w-28 text-right">Status</span>
              </div>

              <ul className="divide-y divide-[color:var(--card-border)]">
                {projectsWithStats.map((project) => (
                  <li key={String(project._id)}>
                    <div className="flex flex-col gap-4 px-4 py-4 lg:grid lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center lg:gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/project/${project._id}`}
                          className="font-medium hover:text-accent"
                        >
                          {project.name}
                        </Link>
                        {project.description ? (
                          <p className="mt-0.5 truncate text-sm text-muted">
                            {project.description}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-2 lg:hidden">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[project.status]}`}
                          >
                            {statusLabels[project.status]}
                          </span>
                          <span className="text-xs text-muted">
                            {project.totalLogs.toLocaleString()} logs
                          </span>
                        </div>
                        <div className="mt-2">
                          <CopyBadge value={project.apiKey} hideValue />
                        </div>
                      </div>

                      <p className="hidden w-20 text-right text-sm tabular-nums lg:block">
                        {project.totalLogs.toLocaleString()}
                      </p>
                      <p
                        className={`hidden w-24 text-right text-sm tabular-nums lg:block ${
                          project.activeIncidents > 0 ? "text-red-600 dark:text-red-400" : ""
                        }`}
                      >
                        {project.activeIncidents}
                      </p>
                      <p className="hidden w-24 text-right text-sm text-muted lg:block">
                        {project.totalLogs > 0
                          ? timeAgo(project.lastLogReceived)
                          : "—"}
                      </p>
                      <div className="flex items-center justify-between gap-3 lg:w-28 lg:justify-end">
                        <span
                          className={`hidden rounded-md px-2 py-0.5 text-xs font-medium lg:inline-block ${statusStyles[project.status]}`}
                        >
                          {statusLabels[project.status]}
                        </span>
                        <div className="flex items-center gap-3">
                          <DeleteProjectButton
                            projectId={String(project._id)}
                            projectName={project.name}
                          />
                          <Link
                            href={`/project/${project._id}`}
                            className="rounded-md border border-[color:var(--card-border)] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
