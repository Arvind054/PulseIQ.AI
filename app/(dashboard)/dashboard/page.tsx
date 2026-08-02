import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectDB } from "@/src/DB/DbConnection";
import { Project } from "@/src/DB/models/projectSchema";
import { Log } from "@/src/DB/models/logSchema";
import { Incident } from "@/src/DB/models/incidentSchemas";
import { Navbar } from "@/app/components/navbar";
import { CreateProjectDialog } from "@/app/components/create-project-dialog";
import { DeleteProjectButton } from "@/app/components/delete-project-button";
import { CopyBadge } from "@/app/components/copy-badge";
import { SimulateButton } from "@/app/components/simulate-button";

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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 65);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
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

  const projectIds = projects.map((p) => p._id);
  const totalProjects = projects.length;

  // Gather stats for all projects
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

      // Unique environments present in this project's logs
      const environments = await Log.distinct("environment", { projectId: project._id });

      // Errors in the last 24h
      // eslint-disable-next-line react-hooks/purity
      const errorRate24h = await Log.countDocuments({
        projectId: project._id,
        level: "ERROR",
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      // Warns in the last 24h
      // eslint-disable-next-line react-hooks/purity
      const warnRate24h = await Log.countDocuments({
        projectId: project._id,
        level: "WARN",
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      // Health status definition
      let status: ProjectStats["status"] = "inactive";
      if (totalLogs > 0) {
        if (errorRate24h > 0) {
          status = "error";
        } else if (warnRate24h > 0) {
          status = "warn";
        } else {
          status = "healthy";
        }
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

  // Global calculations
  const grandTotalLogs =
    totalProjects > 0 ? await Log.countDocuments({ projectId: { $in: projectIds } }) : 0;
  const grandActiveIncidents =
    totalProjects > 0
      ? await Incident.countDocuments({
          projectId: { $in: projectIds },
          status: { $in: ["OPEN", "INVESTIGATING"] },
        })
      : 0;

  // eslint-disable-next-line react-hooks/purity
  const totalErrors24h =
    totalProjects > 0
      ? await Log.countDocuments({
          projectId: { $in: projectIds },
          level: "ERROR",
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        })
      : 0;

  return (
    <div className="relative min-h-screen bg-[var(--background)] px-4 pb-12 pt-24 text-[var(--foreground)] sm:px-6 lg:px-8 lg:pt-28">
      {/* Background patterns */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 dark:opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 glow-orb opacity-35 dark:opacity-40" />

      <Navbar />

      <div className="relative mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col gap-4 border-b border-[color:var(--card-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
              Observability
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-white">
              Welcome back, {session.user.name || "Developer"}
            </h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Manage error pipelines, view analytical events and trigger root cause diagnostic sweeps.
            </p>
          </div>
          <CreateProjectDialog
            buttonLabel="+ New Project"
            buttonClassName="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 dark:from-cyan-500 dark:to-cyan-400 dark:hover:from-cyan-400 dark:hover:to-sky-300 px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 border border-transparent shadow shadow-cyan-500/10 dark:shadow-cyan-500/25 transition hover:shadow-cyan-500/40 relative active:scale-[0.98]"
          />
        </div>

        {/* Global Statistics Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-cyan-500/5 blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[color:var(--muted)]">Active Projects</span>
              <svg className="h-5 w-5 text-cyan-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{totalProjects}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">Observing active workloads</p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-indigo-500/5 blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[color:var(--muted)]">Logs Ingested</span>
              <svg className="h-5 w-5 text-indigo-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-4.755-.95-7.14-2.58" />
              </svg>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{grandTotalLogs.toLocaleString()}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">Telemetry streams routed</p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-rose-500/5 blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[color:var(--muted)]">Active Incidents</span>
              <svg className="h-5 w-5 text-rose-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className={`mt-3 text-3xl font-extrabold tracking-tight ${grandActiveIncidents > 0 ? "text-rose-600 dark:text-rose-455" : ""}`}>
              {grandActiveIncidents}
            </p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">Unresolved system anomalies</p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/5 blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[color:var(--muted)]">System Error Rate (24h)</span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${totalErrors24h > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-555"}`}>
                {totalErrors24h > 0 ? "Alert active" : "Normal"}
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{totalErrors24h}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">Uncatchable fatal events</p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-[color:var(--card-border)] pb-3">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Workspace Projects</h2>
          </div>
          
          {projectsWithStats.length === 0 ? (
            <div className="mt-4 rounded-[28px] border border-dashed border-[color:var(--card-border)] bg-[var(--card)] p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">No projects monitored</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[color:var(--muted)] leading-relaxed">
                Start collecting service metrics, cascading failures, and AI summaries by creating your first container project.
              </p>
              <CreateProjectDialog
                buttonLabel="Create project"
                buttonClassName="mt-6 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projectsWithStats.map((project) => {
                const statusColors = {
                  healthy: {
                    bg: "bg-emerald-400/10 text-emerald-500 border-emerald-500/20",
                    glow: "bg-emerald-400 shadow-emerald-400/30",
                    text: "Healthy",
                  },
                  warn: {
                    bg: "bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-400/20",
                    glow: "bg-amber-400 shadow-amber-400/30",
                    text: "Warnings",
                  },
                  error: {
                    bg: "bg-rose-400/10 text-rose-600 dark:text-rose-455 border-rose-455/20",
                    glow: "bg-rose-500 dark:bg-rose-400 shadow-rose-400/30 animate-pulse",
                    text: "Incident Alert",
                  },
                  inactive: {
                    bg: "bg-zinc-100 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/5",
                    glow: "bg-zinc-400 shadow-zinc-400/30",
                    text: "Inactive",
                  },
                };

                const currentStatus = statusColors[project.status];

                return (
                  <article
                    key={String(project._id)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[color:var(--card-border)] bg-[var(--card)] p-5 shadow-sm transition hover:shadow-md hover:border-zinc-350 dark:hover:border-zinc-850"
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-28 w-28 rounded-full bg-cyan-500/0 blur-2xl transition group-hover:bg-cyan-500/5 dark:group-hover:bg-cyan-400/5" />
                    
                    {/* Top Header */}
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold leading-5 ${currentStatus.bg}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_8px] ${currentStatus.glow}`} />
                          {currentStatus.text}
                        </div>
                        <span className="text-xs text-[color:var(--muted)]">
                          Created {timeAgo(project.createdAt)}
                        </span>
                      </div>

                      {/* Title and description */}
                      <h3 className="mt-3 text-lg font-bold tracking-tight text-zinc-950 dark:text-white transition group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                        {project.name}
                      </h3>
                      <p className="mt-2 min-h-[44px] text-xs text-[color:var(--muted)] leading-relaxed line-clamp-2">
                        {project.description?.trim() || "No customized configuration details available for this dashboard target."}
                      </p>
                    </div>

                    {/* Middleware Details */}
                    <div className="relative mt-4 space-y-2 border-t border-[color:var(--card-border)] pt-4">
                      {/* API key display */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                          API Key
                        </span>
                        <CopyBadge value={project.apiKey} hideValue={true} />
                      </div>

                      {/* Metrics display */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.02] p-2 border border-zinc-200/50 dark:border-white/5">
                          <p className="font-extrabold text-zinc-900 dark:text-white">
                            {project.totalLogs.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-[color:var(--muted)] uppercase font-semibold mt-0.5">Logs</p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.02] p-2 border border-zinc-200/50 dark:border-white/5">
                          <p className={`font-extrabold ${project.activeIncidents > 0 ? "text-rose-500" : "text-zinc-900 dark:text-white"}`}>
                            {project.activeIncidents}
                          </p>
                          <p className="text-[9px] text-[color:var(--muted)] uppercase font-semibold mt-0.5">Incidents</p>
                        </div>
                      </div>

                      {/* Environments list */}
                      {project.environments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[9px] font-semibold text-[color:var(--muted)] uppercase tracking-wider mr-1">Envs:</span>
                          {project.environments.map((env) => (
                            <span
                              key={env}
                              className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider border border-zinc-200 dark:border-white/5 text-zinc-450 dark:text-zinc-400 bg-zinc-50 dark:bg-white/[0.03]"
                            >
                              {env}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="relative mt-5 flex items-center justify-between border-t border-[color:var(--card-border)] pt-4">
                      <div className="text-zinc-[450] text-[10px] dark:text-zinc-400">
                        {project.totalLogs > 0 ? (
                          <span>Active: <span className="font-semibold text-zinc-900 dark:text-white">{timeAgo(project.lastLogReceived)}</span></span>
                        ) : (
                          <span className="text-zinc-400">No logs ingested</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <DeleteProjectButton
                          projectId={String(project._id)}
                          projectName={project.name}
                          buttonClassName="text-xs font-semibold text-rose-500 transition hover:text-rose-600 hover:underline"
                        />
                        <Link
                          href={`/project/${project._id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-white hover:bg-cyan-600 dark:hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-white dark:text-zinc-900 transition hover:shadow-md hover:scale-[1.03] active:scale-[0.98]"
                        >
                          Open Workspace
                          <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}