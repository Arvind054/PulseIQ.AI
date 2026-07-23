import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";

export function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 glow-orb" />

      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-zinc-200 bg-zinc-50/50 p-12 dark:border-white/[0.06] dark:bg-white/[0.02] lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" aria-hidden>
              <path
                d="M3 12h4l2-5 4 10 2-5h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-xl font-semibold tracking-tight">
            Pulse<span className="text-cyan-600 dark:text-cyan-400">IQ</span>.AI
          </span>
        </Link>

        <div>
          <blockquote className="text-2xl font-medium leading-snug tracking-tight text-zinc-800 dark:text-zinc-200">
            &ldquo;We cut mean-time-to-resolution from hours to minutes by tracing
            cascade failures back to the source.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-zinc-500">
            — Platform team, Series B startup
          </p>
        </div>

        <div className="flex gap-8 text-sm text-zinc-500">
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">12s</p>
            <p className="mt-1">Avg. root cause time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">94%</p>
            <p className="mt-1">Cascade accuracy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">10M+</p>
            <p className="mt-1">Logs / minute</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" aria-hidden>
                <path
                  d="M3 12h4l2-5 4 10 2-5h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold">
              Pulse<span className="text-cyan-600 dark:text-cyan-400">IQ</span>.AI
            </span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
