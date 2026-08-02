"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateProjectDialogProps = {
  buttonLabel: string;
  buttonClassName: string;
  secondaryLabel?: string;
};

export function CreateProjectDialog({
  buttonLabel,
  buttonClassName,
  secondaryLabel,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setError("");
    setIsSubmitting(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Unable to create project.");
        setIsSubmitting(false);
        return;
      }

      handleClose();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName}
      >
        {buttonLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0f1219]">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
            
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
                  New project
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Create a new project
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-zinc-150 bg-zinc-50 p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:border-white/5 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative mt-6 space-y-5">
              <div>
                <label htmlFor="project-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Project name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Service Monitor"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 dark:border-white/5 dark:bg-white/5 dark:text-white dark:placeholder-zinc-500 dark:focus:border-cyan-400 dark:focus:bg-[#06080f] dark:focus:ring-cyan-400/10"
                  required
                />
              </div>

              <div>
                <label htmlFor="project-description" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Shortly describe what this project is for"
                  rows={4}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 dark:border-white/5 dark:bg-white/5 dark:text-white dark:placeholder-zinc-500 dark:focus:border-cyan-400 dark:focus:bg-[#06080f] dark:focus:ring-cyan-400/10"
                />
              </div>

              {error ? (
                <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isSubmitting ? "Creating..." : secondaryLabel || "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
