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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">
              Delete project
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              Are you sure you want to delete this project?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This will remove <span className="font-semibold text-slate-900">{projectName}</span> and its related data.
            </p>

            {error ? (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            ) : null}

            <form onSubmit={handleDelete} className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Yes, delete"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
