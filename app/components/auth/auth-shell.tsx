import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { Logo } from "../logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between border-r border-[color:var(--card-border)] bg-zinc-50 p-12 dark:bg-zinc-900/50 lg:flex">
        <Logo />
        <div className="max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight">
            Observability that shows you what broke first
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Monitor logs, trace failures across services, and resolve incidents faster
            with clear root-cause analysis.
          </p>
        </div>
        <p className="text-sm text-muted">© PulseIQ.AI</p>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-4 lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
