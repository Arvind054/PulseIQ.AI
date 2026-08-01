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
    <div className="rounded-[24px] border border-[color:var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[color:var(--card-border)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--accent)]">
            Logs
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Recent activity</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={level}
            onChange={(e) => {
              setPage(1);
              setLevel(e.target.value);
            }}
            className="rounded-xl border border-[color:var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[color:var(--accent)]"
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
            className="rounded-xl border border-[color:var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[color:var(--accent)]"
          >
            <option value="all">All environments</option>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>

          <input
            value={service}
            onChange={(e) => {
              setPage(1);
              setService(e.target.value);
            }}
            placeholder="Filter service"
            className="rounded-xl border border-[color:var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[color:var(--accent)]"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search logs by text or service"
          className="flex-1 rounded-xl border border-[color:var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[color:var(--accent)]"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Search
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--accent-dim)] p-4 text-sm text-[color:var(--muted)]">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--card-border)] bg-[color:var(--accent-dim)] p-6 text-center text-sm text-[color:var(--muted)]">
            No logs match your current filters.
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log._id;

            return (
              <div key={log._id} className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--background)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[color:var(--accent-dim)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--accent)]">
                      {log.level}
                    </span>
                    <span className="text-sm font-medium text-[var(--foreground)]">{log.service}</span>
                  </div>
                  <span className="text-xs text-[color:var(--muted)]">{formatTime(log.timestamp)}</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{log.message}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  {log.environment ? (
                    <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
                      {log.environment}
                    </p>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
                      No environment
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                    className="text-sm font-semibold text-[color:var(--accent)]"
                  >
                    {isExpanded ? "Hide details" : "View details"}
                  </button>
                </div>

                {isExpanded ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--accent-dim)] p-3 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                          Timestamp
                        </p>
                        <p className="mt-1 text-[var(--foreground)]">{formatTime(log.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                          Service
                        </p>
                        <p className="mt-1 text-[var(--foreground)]">{log.service || "—"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Environment
                      </p>
                      <p className="mt-1 text-[var(--foreground)]">{log.environment || "—"}</p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">
                        Metadata
                      </p>
                      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs text-[color:var(--muted)]">
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
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--card-border)] pt-4">
          <p className="text-sm text-[color:var(--muted)]">
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} total
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={!pagination.hasPreviousPage}
              className="rounded-xl border border-[color:var(--card-border)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={!pagination.hasNextPage}
              className="rounded-xl border border-[color:var(--card-border)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
