import Link from "next/link";
import { SiteHeader } from "./components/site-header";

const features = [
  {
    title: "Centralized logs",
    description:
      "Collect logs from every service in one place. Search, filter, and inspect events without switching tools.",
  },
  {
    title: "Root cause detection",
    description:
      "AI correlates errors across services to find where failures start — not just the noisiest downstream symptom.",
  },
  {
    title: "Failure chains",
    description:
      "See how one outage propagates through your stack, service by service, in chronological order.",
  },
  {
    title: "Incident summaries",
    description:
      "Get concise context on affected services, error patterns, and suggested next steps when things break.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="border-b border-[color:var(--card-border)] px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-accent">Observability platform</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
                Know what broke first, and what failed because of it
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                PulseIQ.AI monitors your system logs and traces errors back to their
                origin — showing which service failed first and how the impact spread.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Get started
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-md border border-[color:var(--card-border)] bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Read the docs
                </Link>
              </div>
            </div>

            <div className="mt-16 overflow-hidden rounded-lg border border-[color:var(--card-border)] bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-[color:var(--card-border)] px-4 py-3">
                <span className="text-sm font-medium">Incident overview</span>
                <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  1 active incident
                </span>
              </div>
              <div className="grid divide-y divide-[color:var(--card-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Root cause</p>
                  <p className="mt-2 font-mono text-sm">auth-service</p>
                  <p className="mt-1 text-sm text-muted">
                    Connection pool exhausted at 14:32:07 UTC
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Affected services
                  </p>
                  <ul className="mt-2 space-y-1.5 font-mono text-sm">
                    <li className="flex items-center justify-between">
                      <span>user-db</span>
                      <span className="text-xs text-red-600 dark:text-red-400">failed</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>order-service</span>
                      <span className="text-xs text-red-600 dark:text-red-400">failed</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>payment-api</span>
                      <span className="text-xs text-red-600 dark:text-red-400">failed</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>notification</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">degraded</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold tracking-tight">Built for on-call teams</h2>
            <p className="mt-2 max-w-xl text-muted">
              Everything you need to understand production failures without digging through
              scattered log files.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-[color:var(--card-border)] bg-card p-6"
                >
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[color:var(--card-border)] px-6 py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Start monitoring today</h2>
              <p className="mt-2 text-muted">
                Create a project, install the SDK, and stream your first logs in minutes.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Create free account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:var(--card-border)] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} PulseIQ.AI
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
