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
    ? `${value.slice(0, 8)}···${value.slice(-4)}`
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
      className={`inline-flex items-center gap-1.5 rounded-md border border-[color:var(--card-border)] bg-zinc-50 px-2 py-1 font-mono text-xs text-muted transition hover:text-foreground dark:bg-zinc-800/50 ${className}`}
      title="Click to copy"
    >
      <span>{displayValue}</span>
      <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
