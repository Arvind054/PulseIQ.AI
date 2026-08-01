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

export function LogsPanel({ projectId }: LogsPanelProps) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("all");
  const [service, setService] = useState("");
  const [environment, setEnvironment] = useState("all");
  const [search, setSearch] = useState("");
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
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/logs?${params.toString()}`);
      const data = await response.json();

      if (data?.success) {
        setLogs(data.data || []);
        setPagination(data.pagination || null);
      }

      setLoading(false);
    }

    fetchLogs();
  }, [page, level, service, environment, search, projectId]);

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

      <div className="mt-4">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search logs by text or service"
          className="w-full rounded-xl border border-[color:var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[color:var(--accent)]"
        />
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
          logs.map((log) => (
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

              {log.environment ? (
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[color:var(--muted)]">
                  {log.environment}
                </p>
              ) : null}
            </div>
          ))
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
