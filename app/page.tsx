import Link from "next/link";
import { Navbar } from "./components/navbar";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 6h16M4 12h10M4 18h14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Unified log ingestion",
    description:
      "Stream logs from every service, container, and cloud provider into one searchable timeline.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "AI root-cause analysis",
    description:
      "Our models correlate errors across services and surface the true origin — not just the loudest symptom.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M6 18V9m6 9V5m6 13v-7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 21h18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Cascade failure mapping",
    description:
      "Visualize how one failure ripples through your stack — see what broke first and what fell after.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Instant incident context",
    description:
      "Get AI-generated summaries with affected services, error chains, and suggested fixes in seconds.",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect your systems",
    description: "Deploy a lightweight agent or forward logs via OpenTelemetry, Fluentd, or our API.",
  },
  {
    step: "02",
    title: "AI analyzes patterns",
    description: "Models scan millions of log lines, detect anomalies, and build dependency graphs in real time.",
  },
  {
    step: "03",
    title: "Pinpoint the root cause",
    description: "See exactly which service failed first, why it failed, and which downstream systems were impacted.",
  },
];

const services = [
  { name: "API Gateway", status: "healthy" as const },
  { name: "Auth Service", status: "root" as const },
  { name: "User DB", status: "failed" as const },
  { name: "Order Service", status: "failed" as const },
  { name: "Payment API", status: "failed" as const },
  { name: "Notification", status: "degraded" as const },
];

function StatusDot({ status }: { status: (typeof services)[number]["status"] }) {
  const styles = {
    healthy: "bg-emerald-400 shadow-emerald-400/50",
    root: "bg-amber-400 shadow-amber-400/50 animate-pulse",
    failed: "bg-red-400 shadow-red-400/50",
    degraded: "bg-orange-400 shadow-orange-400/50",
  };

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full shadow-[0_0_8px] ${styles[status]}`}
    />
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 glow-orb" />

      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-700 dark:border-cyan-500/20 dark:text-cyan-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                AI-powered observability
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl sm:leading-[1.1]">
                Find what broke first,{" "}
                <span className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent dark:from-cyan-400 dark:via-sky-300 dark:to-violet-400">
                  before the cascade spreads
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl">
                PulseIQ.AI monitors your system logs and uses AI to trace errors
                back to their root cause — revealing which service failed first
                and how the failure propagated across your stack.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-3.5 text-sm font-semibold text-zinc-900 shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 sm:w-auto"
                >
                  Open Dashboard
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-6 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-200 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:border-white/20 dark:hover:bg-white/[0.06] sm:w-auto"
                >
                  See how it works
                </Link>
              </div>
            </div>

            {/* Cascade visualization */}
            <div className="relative mx-auto mt-20 max-w-4xl animate-float">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-200/60 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0f1219]/80 dark:shadow-black/40 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-400/80" />
                      <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                    </div>
                    <span className="font-mono text-xs text-zinc-500">
                      incident-trace · live
                    </span>
                  </div>
                  <span className="rounded-md bg-red-500/10 px-2.5 py-1 font-mono text-xs text-red-400">
                    P0 · cascade detected
                  </span>
                </div>

                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                        <path
                          d="M12 9v4m0 4h.01M10.3 4.3l-8.6 14.9A2 2 0 003.4 22h17.2a2 2 0 001.7-2.8l-8.6-14.9a2 2 0 00-3.4 0z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Root cause identified
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-mono text-amber-700 dark:text-amber-300">auth-service</span>{" "}
                        connection pool exhausted at{" "}
                        <span className="font-mono text-zinc-800 dark:text-zinc-300">14:32:07 UTC</span>.
                        Cascade triggered failures in 4 downstream services within 12s.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                        service.status === "root"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : service.status === "failed"
                            ? "border-red-500/20 bg-red-500/5"
                            : service.status === "degraded"
                              ? "border-orange-500/20 bg-orange-500/5"
                              : "border-zinc-200 bg-zinc-50 dark:border-white/[0.06] dark:bg-white/[0.02]"
                      }`}
                    >
                      <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                        {service.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <StatusDot status={service.status} />
                        <span
                          className={`text-xs capitalize ${
                            service.status === "root"
                              ? "text-amber-400"
                              : service.status === "failed"
                                ? "text-red-400"
                                : service.status === "degraded"
                                  ? "text-orange-400"
                                  : "text-emerald-400"
                          }`}
                        >
                          {service.status === "root" ? "origin" : service.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 font-mono text-xs text-zinc-400 dark:text-zinc-600">
                  <span className="text-red-400">auth-service</span>
                  <span>→</span>
                  <span className="text-red-400">user-db</span>
                  <span>→</span>
                  <span className="text-red-400">order-service</span>
                  <span>→</span>
                  <span className="text-red-400">payment-api</span>
                  <span>→</span>
                  <span className="text-orange-400">notification</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-zinc-200 bg-zinc-50 px-6 py-16 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
            {[
              { value: "12s", label: "Avg. time to root cause" },
              { value: "94%", label: "Cascade accuracy" },
              { value: "10M+", label: "Logs analyzed per minute" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Observability that thinks ahead
              </h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Stop drowning in logs. PulseIQ.AI connects the dots across your
                entire infrastructure so you can fix the real problem, fast.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-zinc-200 bg-white p-8 transition-colors hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 dark:border-white/[0.06] dark:bg-[#0f1219] dark:hover:border-cyan-500/20 dark:hover:bg-[#0f1219]/80"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 transition-colors group-hover:bg-cyan-500/20 dark:text-cyan-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                From noise to root cause in three steps
              </h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Set up in minutes. Let AI do the heavy lifting when things go wrong.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="relative">
                  <span className="font-mono text-5xl font-bold text-zinc-900/[0.04] dark:text-white/[0.04]">
                    {item.step}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className="px-6 pb-24 sm:pb-32">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-cyan-500/10 via-white to-violet-500/10 px-8 py-16 text-center dark:border-white/[0.08] dark:from-cyan-500/10 dark:via-[#0f1219] dark:to-violet-500/10 sm:px-16">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_60%)]" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to see what&apos;s really breaking?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
                  Join teams who cut mean-time-to-resolution by tracing cascade
                  failures back to their source — automatically.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:shadow-white/10"
                >
                  Get started free
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 px-6 py-8 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} PulseIQ.AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/docs" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-300">
              Docs
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-300">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-300">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
