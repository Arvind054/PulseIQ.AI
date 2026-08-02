"use client";

import { useEffect, useState } from "react";

type LogItem = {
  _id: string;
  service: string;
  level: string;
  message: string;
  environment?: string;
  timestamp?: string | Date;
  metadata?: Record<string, unknown>;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type LogsPanelProps = {
  projectId: string;
};

function formatTime(value?: string | Date) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMetadataValue(value: unknown) {
  if (!value) return "—";

  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function LogsPanel({ projectId }: LogsPanelProps) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("all");
  const [service, setService] = useState("");
  const [environment, setEnvironment] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);

      const params = new URLSearchParams({
        projectId,
        page: String(page),
        limit: "10",
      });

      if (level !== "all") params.set("level", level);
      if (service.trim()) params.set("service", service.trim());
      if (environment !== "all") params.set("environment", environment);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const response = await fetch(`/api/logs?${params.toString()}`);
      const data = await response.json();

      if (data?.success) {
        setLogs(data.data || []);
        setPagination(data.pagination || null);
      }

      setLoading(false);
    }

    fetchLogs();
  }, [page, level, service, environment, searchQuery, projectId]);

  function handleSearch() {
    setPage(1);
    setExpandedLogId(null);
    setSearchQuery(searchInput.trim());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  }

  return (
    <div className="rounded-[28px] border border-[color:var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[color:var(--card-border)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
            Log Stream
          </p>
          <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">Recent Activity</h2>
        </div>

        <div className="grid gap-2 min-w-[320px] sm:grid-cols-3">
          <select
            value={level}
            onChange={(e) => {
              setPage(1);
              setLevel(e.target.value);
            }}
            className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-white/5 px-3 py-2.5 text-xs text-zinc-700 dark:text-zinc-350 outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-[#06080f] dark:focus:border-cyan-400"
          >
            <option value="all">All levels</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warn</option>
            <option value="ERROR">Error</option>
            <option value="DEBUG">Debug</option>
          </select>

          <select
            value={environment}
            onChange={(e) => {
              setPage(1);
              setEnvironment(e.target.value);
            }}
            className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-white/5 px-3 py-2.5 text-xs text-zinc-700 dark:text-zinc-350 outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-[#06080f] dark:focus:border-cyan-400"
          >
            <option value="all">All envs</option>
            <option value="development">Dev</option>
            <option value="staging">Staging</option>
            <option value="production">Prod</option>
          </select>

          <input
            value={service}
            onChange={(e) => {
              setPage(1);
              setService(e.target.value);
            }}
            placeholder="Service name..."
            className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-white/5 px-3 py-2.5 text-xs text-zinc-700 dark:text-zinc-350 outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-[#06080f] dark:focus:border-cyan-400 placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search logs message contents..."
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-white/5 px-4 py-2.5 text-xs text-zinc-900 dark:text-white outline-none transition focus:border-cyan-500 focus:bg-white dark:focus:bg-[#06080f] dark:focus:border-cyan-400 placeholder-zinc-400 dark:placeholder-zinc-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-550 dark:hover:bg-cyan-400 px-5 py-2.5 text-xs font-bold text-white dark:text-zinc-900 shadow transition hover:shadow-cyan-550/15"
        >
          Search
        </button>
      </div>

      <div className="mt-5 space-y-2.5">
        {loading ? (
          <div className="rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.01] p-6 text-center text-xs text-zinc-450 dark:text-zinc-500 flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Polling telemetry stream logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200/60 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.01] p-10 text-center text-xs text-zinc-450 dark:text-zinc-500">
            No telemetry logs match the current query criteria.
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log._id;

            const badgeStyles = {
              INFO: "bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15",
              DEBUG: "bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-500/15",
              WARN: "bg-amber-400/10 text-amber-600 dark:text-amber-450 border border-amber-500/15",
              ERROR: "bg-rose-400/10 text-rose-650 dark:text-rose-455 border border-rose-455/15",
            };

            const levelClass = badgeStyles[log.level as keyof typeof badgeStyles] || "bg-zinc-100 text-zinc-650 border border-zinc-200";

            return (
              <div
                key={log._id}
                className={`overflow-hidden rounded-2xl border transition bg-[var(--card)] ${
                  isExpanded
                    ? "border-cyan-500/25 shadow-sm shadow-cyan-500/5 bg-cyan-500/[0.005]"
                    : "border-zinc-200/60 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10"
                }`}
              >
                {/* Header line info */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 hover:bg-zinc-50/50 dark:hover:bg-white/[0.005]"
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded-xl px-2 py-0.5 text-[9px] font-bold tracking-wider leading-relaxed ${levelClass}`}>
                      {log.level}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {log.service}
                    </span>
                    <span className="hidden sm:inline text-zinc-350 dark:text-zinc-600">•</span>
                    {log.environment && (
                      <span className="hidden sm:inline rounded bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                        {log.environment}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {formatTime(log.timestamp)}
                  </span>
                </div>

                {/* Message Body */}
                <div className="px-4 pb-4">
                  <p className="font-mono text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 break-words line-clamp-3">
                    {log.message}
                  </p>

                  <div className="mt-3 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                      className="text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-0.5 transition"
                    >
                      {isExpanded ? (
                        <>
                          Hide diagnostics
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Examine metadata
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Meta details drawer */}
                {isExpanded ? (
                  <div className="border-t border-zinc-200/50 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.01]/30 p-4 space-y-3 font-mono text-[11px] leading-relaxed">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Timestamp
                        </p>
                        <p className="mt-0.5 text-zinc-800 dark:text-zinc-200">{formatTime(log.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Microservice
                        </p>
                        <p className="mt-0.5 text-zinc-800 dark:text-zinc-200">{log.service || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Environment
                        </p>
                        <p className="mt-0.5 text-zinc-800 dark:text-zinc-200 capitalize">{log.environment || "—"}</p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-200/40 dark:border-white/5 pt-3">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                        Metadata Payload
                      </p>
                      <pre className="overflow-x-auto rounded-xl bg-zinc-900 border border-zinc-200/30 dark:border-white/5 text-zinc-300 dark:bg-[#06080f] p-3 text-[10px] max-h-48 whitespace-pre">
                        {formatMetadataValue(log.metadata)}
                      </pre>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {pagination ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--card-border)] pt-4">
          <p className="text-xs text-[color:var(--muted)]">
            Page {pagination.page} of {pagination.totalPages} • <b>{pagination.total}</b> events ingestion count
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!pagination.hasPreviousPage}
              className="rounded-xl border border-zinc-200 dark:border-white/5 px-3.5 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 transition active:scale-95"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={!pagination.hasNextPage}
              className="rounded-xl border border-zinc-200 dark:border-white/5 px-3.5 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 transition active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
