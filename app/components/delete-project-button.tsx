"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
};

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Unable to delete project.");
        setIsDeleting(false);
        return;
      }

      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong while deleting the project.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-red-600 transition-colors hover:text-red-700 dark:text-red-400"
      >
        Delete
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-lg border border-[color:var(--card-border)] bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Delete project?</h2>
            <p className="mt-2 text-sm text-muted">
              This permanently deletes <span className="font-medium text-foreground">{projectName}</span> and all associated logs and incidents.
            </p>

            {error ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            ) : null}

            <form onSubmit={handleDelete} className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-[color:var(--card-border)] px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
