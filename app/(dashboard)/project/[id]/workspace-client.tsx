"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogsPanel } from "./logs-panel";
import { CopyBadge } from "@/app/components/copy-badge";
import { SimulateButton } from "@/app/components/simulate-button";

type Project = {
  _id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type LogItem = {
  _id: string;
  service: string;
  level: string;
  message: string;
  environment?: string;
  timestamp?: string | Date;
  metadata?: Record<string, unknown>;
};

type AiSuggestion = {
  _id?: string;
  summary?: string;
  rootCause?: string;
  recommendation?: string;
  model?: string;
  evidence?: string;
  confidence?: number;
};

type Incident = {
  _id: string;
  title: string;
  serverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
  summary?: string;
  rootCause?: string;
  aiSuggestions?: AiSuggestion | string | null;
  relatedLogs?: LogItem[];
  createdAt: string;
};

type WorkspaceClientProps = {
  project: Project;
};

export function WorkspaceClient({ project: initialProject }: WorkspaceClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"logs" | "incidents" | "settings">("logs");
  const [project, setProject] = useState<Project>(initialProject);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);
  
  // Settings Form State
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  
  // Integrations Tab state
  const [integrationLang, setIntegrationLang] = useState<"curl" | "node" | "python">("curl");

  // Fetch Incidents
  const fetchIncidents = useCallback(async () => {
    await Promise.resolve(); // Defer state sets to avoid synchronous render path cascades
    setLoadingIncidents(true);
    try {
      const response = await fetch(`/api/incidents?projectId=${project._id}`);
      const data = await response.json();
      if (data?.success) {
        setIncidents(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    } finally {
      setLoadingIncidents(false);
    }
  }, [project._id]);

  useEffect(() => {
    if (activeTab === "incidents") {
      fetchIncidents();
    }
  }, [activeTab, fetchIncidents]);

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsError("");
    setSettingsSuccess(false);

    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Unable to save project details.");
      }

      setSettingsSuccess(true);
      setProject((p) => ({ ...p, name, description }));
      router.refresh();
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Regenerate API Key
  const handleRegenerateKey = async () => {
    if (!confirm("This will invalidate the current API key immediately. Are you sure you want to regenerate it?")) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project._id}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to regenerate API Key.");
      }

      const data = await response.json();
      setProject((p) => ({ ...p, apiKey: data.project.apiKey }));
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Regeneration failed.");
    }
  };

  // Update Incident Status
  const handleUpdateIncidentStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setIncidents((curr) =>
          curr.map((inc) => (inc._id === id ? { ...inc, status: newStatus as Incident["status"] } : inc))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Incident
  const handleDeleteIncident = async (id: string) => {
    if (!confirm("Delete this diagnostic analysis record?")) return;

    try {
      const response = await fetch(`/api/incidents/${id}`, { method: "DELETE" });
      if (response.ok) {
        setIncidents((curr) => curr.filter((inc) => inc._id !== id));
        if (expandedIncidentId === id) setExpandedIncidentId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Code snippets for copy
  const getHost = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  };

  const curlSnippet = `curl -X POST ${getHost()}/api/logs \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${project.apiKey}" \\
  -d '{
    "service": "auth-service",
    "level": "ERROR",
    "message": "Database pool exhausted. Active connections: 20.",
    "environment": "production",
    "metadata": { "pool_size": 20, "active": 20 }
  }'`;

  const nodeSnippet = `fetch('${getHost()}/api/logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${project.apiKey}'
  },
  body: JSON.stringify({
    service: 'web-gateway',
    level: 'WARN',
    message: 'Database query latency exceeded threshold',
    environment: 'production',
    metadata: { path: '/checkout', latency_ms: 2200 }
  })
});`;

  const pythonSnippet = `import requests

def log_to_pulseiq(service, level, message, env="production", metadata=None):
    url = "${getHost()}/api/logs"
    headers = {
        "x-api-key": "${project.apiKey}",
        "Content-Type": "application/json"
    }
    payload = {
        "service": service,
        "level": level,
        "message": message,
        "environment": env,
        "metadata": metadata or {}
    }
    try:
        requests.post(url, json=payload, headers=headers, timeout=2)
    except Exception as e:
        print(f"Failed to route log: {e}")`;

  const openIncidentsCount = incidents.filter((i) => i.status === "OPEN" || i.status === "INVESTIGATING").length;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Workspace Header info */}
      <div className="flex flex-col gap-4 border-b border-(--card-border) pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
            <Link href="/dashboard" className="hover:underline transition">Dashboard</Link>
            <span>/</span>
            <span className="text-muted">Project Workspace</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-muted leading-relaxed max-w-2xl">
            {project.description?.trim() || "No workspace configuration has been set. Review settings to modify details."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-white/5 dark:bg-white/5 hover:bg-zinc-550 px-4 py-2.5 text-xs font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs Selector Navigation Bar */}
      <div className="mt-6 flex border-b border-(--card-border)">
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition relative ${
            activeTab === "logs"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Telemetry Log Stream
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("incidents")}
          className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition flex items-center gap-2 relative ${
            activeTab === "incidents"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          AI Incident Diagnostics
          {openIncidentsCount > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white leading-none">
              {openIncidentsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition relative ${
            activeTab === "settings"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Workspace Settings
        </button>
      </div>

      {/* Content panes based on activeTab */}
      <div className="mt-6">
        {activeTab === "logs" && (
          <div className="space-y-4">
            <LogsPanel projectId={project._id} />
          </div>
        )}

        {activeTab === "incidents" && (
          <div className="space-y-4">
            {loadingIncidents && incidents.length === 0 ? (
              <div className="rounded-3xl border border-(--card-border) bg-card p-8 text-center text-sm text-muted">
                Fetching active incident evaluations...
              </div>
            ) : incidents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-(--card-border) bg-card p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold">All systems healthy</h3>
                <p className="mx-auto mt-2 max-w-sm text-xs text-muted leading-relaxed">
                  No anomalous log patterns or cascade failure trends have been logged. Switch to the <b>Workspace Settings</b> tab to simulate an incident flow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => {
                  const isExpanded = expandedIncidentId === incident._id;
                  
                  const severityColors = {
                    LOW: "bg-blue-400/10 text-blue-500 border-blue-500/20",
                    MEDIUM: "bg-amber-400/10 text-amber-500 border-amber-500/20",
                    HIGH: "bg-orange-400/10 text-orange-500 border-orange-500/20",
                    CRITICAL: "bg-rose-400/10 text-rose-500 border-rose-500/20 animate-pulse",
                  };

                  const statusColors = {
                    OPEN: "bg-red-500 text-white dark:bg-red-400/20 dark:text-red-400 border border-red-500/30",
                    INVESTIGATING: "bg-amber-500 text-white dark:bg-amber-400/20 dark:text-amber-400 border border-amber-500/30",
                    RESOLVED: "bg-emerald-500 text-white dark:bg-emerald-400/20 dark:text-emerald-400 border border-emerald-500/30",
                    CLOSED: "bg-zinc-500 text-white dark:bg-zinc-400/20 dark:text-zinc-300 border border-zinc-500/30",
                  };

                  return (
                    <div
                      key={incident._id}
                      className={`overflow-hidden rounded-3xl border bg-card transition-all shadow-sm ${
                        isExpanded
                          ? "border-cyan-500/40 ring-1 ring-cyan-500/10"
                          : "border-(--card-border) hover:border-zinc-350 dark:hover:border-zinc-850"
                      }`}
                    >
                      {/* Incident Card summary bar */}
                      <div
                        onClick={() => setExpandedIncidentId(isExpanded ? null : incident._id)}
                        className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5 hover:bg-zinc-50 dark:hover:bg-white/1"
                      >
                        <div className="flex flex-1 items-start gap-3">
                          <div className="mt-1 shrink-0">
                            {incident.status === "RESOLVED" ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-555">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-555 animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                              </div>
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-zinc-950 dark:text-white sm:text-base leading-snug">
                              {incident.title}
                            </h4>
                            <p className="mt-1 text-xs text-muted">
                              Detected {new Date(incident.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`rounded-xl border px-2.5 py-0.5 text-[10px] font-bold ${severityColors[incident.serverity]}`}>
                            {incident.serverity}
                          </span>
                          <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-bold leading-5 ${statusColors[incident.status]}`}>
                            {incident.status}
                          </span>
                          <svg
                            className={`h-4 w-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Incident detailed diagnostics */}
                      {isExpanded && (
                        <div className="border-t border-(--card-border) bg-zinc-50/50 dark:bg-white/1 p-6 space-y-6">
                          {/* Failure Chain Visual */}
                          <div className="rounded-2xl border border-(--card-border) bg-card p-5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                              Failure Propagation Chain
                            </h5>
                            
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              {incident.title.includes("Connection Pool") || incident.title.includes("Auth") ? (
                                <>
                                  <span className="flex flex-col items-center rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                    <span>api-gateway</span>
                                    <span className="text-[9px] text-zinc-400 font-sans mt-0.5">(Latency)</span>
                                  </span>

                                  <div className="text-zinc-300 font-bold opacity-60">➜</div>

                                  <span className="flex flex-col items-center rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                    <span>order-service</span>
                                    <span className="text-[9px] text-zinc-400 font-sans mt-0.5">(Cascade Failure)</span>
                                  </span>

                                  <div className="text-zinc-300 font-bold opacity-60">➜</div>

                                  <span className="flex flex-col items-center rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 font-mono text-xs text-rose-500 relative ring-4 ring-rose-500/5 animate-pulse">
                                    <span>auth-service</span>
                                    <span className="text-[9px] font-sans mt-0.5 font-bold uppercase">(Origin)</span>
                                  </span>

                                  <div className="text-zinc-300 font-bold opacity-60">➜</div>

                                  <span className="flex flex-col items-center rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                                    <span>user-db</span>
                                    <span className="text-[9px] text-zinc-400 font-sans mt-0.5">(Query Timeout)</span>
                                  </span>

                                  <div className="text-zinc-300 font-bold opacity-60">➜</div>

                                  <span className="flex flex-col items-center rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 px-3 py-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                    <span>payment-api</span>
                                    <span className="text-[9px] text-zinc-400 font-sans mt-0.5">(Checkout Impact)</span>
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-muted">Service topology cascade mapping unavailable.</span>
                              )}
                            </div>
                          </div>

                          {/* Analysis and Root Causes */}
                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-2xl border border-(--card-border) bg-card p-5">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                Incident Summary
                              </h5>
                              <p className="mt-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                                {incident.summary || "No aggregate summary generated for this trace."}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-(--card-border) bg-card p-5">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                Root Cause Pinpoint
                              </h5>
                              <p className="mt-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                                {incident.rootCause || "No specific root-cause component was isolated."}
                              </p>
                            </div>
                          </div>

                          {/* Suggestions */}
                          <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/2 p-5">
                            <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              AI Recommendation Engine
                            </h5>
                            {typeof incident.aiSuggestions === "object" && incident.aiSuggestions ? (
                              <div className="mt-3 space-y-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                                <p>
                                  <span className="font-semibold text-zinc-900 dark:text-white">Summary: </span>
                                  {incident.aiSuggestions.summary || incident.summary || "No summary available."}
                                </p>
                                <p>
                                  <span className="font-semibold text-zinc-900 dark:text-white">Root cause: </span>
                                  {incident.aiSuggestions.rootCause || incident.rootCause || "No root cause available."}
                                </p>
                                <p>
                                  <span className="font-semibold text-zinc-900 dark:text-white">Evidence: </span>
                                  {incident.aiSuggestions.evidence || "No evidence provided."}
                                </p>
                                <p>
                                  <span className="font-semibold text-zinc-900 dark:text-white">Recommendation: </span>
                                  {incident.aiSuggestions.recommendation || "No recommendation provided."}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                                  <span className="rounded-full bg-cyan-500/10 px-2 py-1">Model: {incident.aiSuggestions.model || "unknown"}</span>
                                  <span className="rounded-full bg-cyan-500/10 px-2 py-1">Confidence: {incident.aiSuggestions.confidence ?? 0}%</span>
                                </div>
                              </div>
                            ) : typeof incident.aiSuggestions === "string" ? (
                              <div className="mt-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line pl-1.5 space-y-1">
                                {incident.aiSuggestions.split("\n").map((item, index) => (
                                  <p key={index} className="flex items-start gap-1.5">
                                    <span className="text-cyan-500 font-bold select-none">•</span>
                                    <span>{item.replace(/^\d+\.\s*/, "")}</span>
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-3 text-xs text-muted">
                                No AI suggestion linked to this incident yet.
                              </p>
                            )}
                          </div>

                          {/* Diagnostics Actions Bar */}
                          <div className="flex border-t border-(--card-border) pt-4 items-center justify-between">
                            <div className="flex items-center gap-3">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                Status
                              </label>
                              <select
                                value={incident.status}
                                onChange={(e) => handleUpdateIncidentStatus(incident._id, e.target.value as Incident["status"])}
                                className="rounded-xl border border-(--card-border) bg-card px-3 py-2 text-xs font-semibold text-zinc-700 outline-none transition focus:border-cyan-500 dark:text-zinc-300"
                              >
                                <option value="OPEN">Open</option>
                                <option value="INVESTIGATING">Investigating</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteIncident(incident._id)}
                              className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline"
                            >
                              Delete report
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            {/* Project Config Form */}
            <div className="rounded-3xl border border-(--card-border) bg-card p-6 shadow-sm">
              <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Workspace Configuration</h3>
              <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="settings-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Project Target Name
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-[#06080f] dark:focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="settings-description" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Description
                  </label>
                  <textarea
                    id="settings-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-[#06080f] dark:focus:border-cyan-400"
                  />
                </div>

                {settingsError ? (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-600 dark:text-red-400">
                    {settingsError}
                  </p>
                ) : null}

                {settingsSuccess ? (
                  <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-600 dark:text-emerald-400">
                    Project workspaces configuration saved.
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-xl bg-cyan-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-cyan-700 active:scale-[0.98]"
                >
                  {savingSettings ? "Saving Settings..." : "Save workspace details"}
                </button>
              </form>
            </div>

            {/* API Key and simulation setup */}
            <div className="space-y-6">
              {/* Credentials Card */}
              <div className="rounded-3xl border border-(--card-border) bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Credentials & Auth</h3>
                
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Project ID
                  </label>
                  <CopyBadge value={project._id} className="w-full justify-between" />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Endpoint API Ingestion Key
                  </label>
                  <CopyBadge value={project.apiKey} className="w-full justify-between" />
                </div>

                <div className="border-t border-(--card-border) pt-4">
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2.5 text-xs text-rose-500 font-bold transition active:scale-95"
                  >
                    Regenerate API Credentials
                  </button>
                </div>
              </div>

              {/* Ingestion guide quick triggers */}
              <div className="rounded-3xl border border-(--card-border) bg-card p-6 shadow-sm space-y-3">
                <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Workspace Quickstart</h3>
                <p className="text-xs leading-relaxed text-muted">
                  Populate this project target immediately with a cluster sequence of 6 logging events and AI failures cascading details.
                </p>
                <SimulateButton
                  projectId={project._id}
                  className="w-full py-3"
                  label="Simulate Log Cascade"
                />
              </div>
            </div>

            {/* Code snippets block */}
            <div className="rounded-3xl border border-(--card-border) bg-card p-6 shadow-sm md:col-span-2">
              <div className="flex border-b border-(--card-border) pb-3 items-center justify-between">
                <h4 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">Integration Snippets</h4>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIntegrationLang("curl")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      integrationLang === "curl" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntegrationLang("node")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      integrationLang === "node" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5"
                    }`}
                  >
                    Node.js
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntegrationLang("python")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      integrationLang === "python" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5"
                    }`}
                  >
                    Python
                  </button>
                </div>
              </div>

              <div className="mt-4 relative">
                <pre className="overflow-x-auto rounded-2xl bg-zinc-900 text-zinc-300 dark:bg-white/2 border border-zinc-200/50 dark:border-white/5 p-4 font-mono text-xs leading-relaxed max-h-80 select-all">
                  {integrationLang === "curl" && curlSnippet}
                  {integrationLang === "node" && nodeSnippet}
                  {integrationLang === "python" && pythonSnippet}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

