"use client";

import { useState } from "react";

type CopyBadgeProps = {
  value: string;
  hideValue?: boolean;
  className?: string;
};

export function CopyBadge({ value, hideValue = false, className = "" }: CopyBadgeProps) {
  const [copied, setCopied] = useState(false);

  const displayValue = hideValue
    ? `${value.slice(0, 8)}········${value.slice(-4)}`
    : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-zinc-650 transition hover:bg-zinc-100 hover:text-zinc-800 dark:border-white/5 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white ${className}`}
      title="Click to copy"
    >
      <span>{displayValue}</span>
      {copied ? (
        <svg
          className="h-3 w-3 text-emerald-500 animate-scale-up"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      )}
    </button>
  );
}
