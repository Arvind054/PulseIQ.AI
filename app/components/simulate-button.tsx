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
  label = "Simulate Incident Cascade",
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
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 align-middle">
      <button
        type="button"
        disabled={loading}
        onClick={triggerSimulation}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600/10 px-4 py-2.5 text-xs font-semibold text-violet-600 border border-violet-500/25 transition hover:bg-violet-650/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-violet-400/10 dark:text-violet-400 dark:border-violet-400/20 dark:hover:bg-violet-400/20 shadow-sm ${className}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : success ? (
          <>
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Cascade Generated!
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && (
        <span className="text-[10px] text-red-500 dark:text-red-455 text-center mt-1 scale-up">
          {error}
        </span>
      )}
    </div>
  );
}
