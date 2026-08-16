"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateProjectDialogProps = {
  label?: string;
};

export function CreateProjectDialog({ label = "New project" }: CreateProjectDialogProps) {
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
        headers: { "Content-Type": "application/json" },
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
        className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
      >
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative w-full max-w-md rounded-lg border border-[color:var(--card-border)] bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Create project</h2>
                <p className="mt-1 text-sm text-muted">
                  Add a new project to start collecting logs.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md p-1.5 text-muted transition-colors hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
                aria-label="Close dialog"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Production API"
                  className="w-full rounded-md border border-[color:var(--card-border)] bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-[color:var(--accent-muted)]"
                  required
                />
              </div>

              <div>
                <label htmlFor="project-description" className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full rounded-md border border-[color:var(--card-border)] bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-[color:var(--accent-muted)]"
                />
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md border border-[color:var(--card-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  {isSubmitting ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
