"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SimulateButtonProps = {
  projectId: string;
  className?: string;
  label?: string;
};

export function SimulateButton({
  projectId,
  className = "",
  label = "Simulate incident",
}: SimulateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const triggerSimulation = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/projects/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Simulation failed.");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={triggerSimulation}
        className={`inline-flex items-center justify-center rounded-md border border-[color:var(--card-border)] px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:hover:bg-zinc-800 ${className}`}
      >
        {loading ? "Generating…" : success ? "Done" : label}
      </button>
      {error ? <span className="text-xs text-red-600 dark:text-red-400">{error}</span> : null}
    </div>
  );
}
