"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
  buttonClassName?: string;
};

export function DeleteProjectButton({
  projectId,
  projectName,
  buttonClassName,
}: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

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
        className={buttonClassName || "text-sm font-semibold text-rose-600 transition hover:text-rose-700"}
      >
        Delete
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0f1219]">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500 dark:text-rose-450">
                Delete project
              </p>
              <h2 className="mt-3 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Are you sure you want to delete this project?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-650 dark:text-zinc-400">
                This will permanently delete <span className="font-semibold text-zinc-900 dark:text-white">{projectName}</span> along with all its ingested logs and AI incidents.
              </p>

              {error ? (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-650 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <form onSubmit={handleDelete} className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/10 transition-all hover:bg-rose-700 hover:shadow-rose-650/20 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
