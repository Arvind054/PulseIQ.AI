import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../components/navbar";

export const metadata: Metadata = {
  title: "Documentation — PulseIQ.AI",
  description:
    "Install the PulseIQ.AI SDK, configure your API key, and start streaming logs for AI-powered root-cause analysis.",
};

const sections = [
  { id: "getting-started", label: "Getting started" },
  { id: "install-sdk", label: "Install the SDK" },
  { id: "api-key", label: "API key" },
  { id: "configure", label: "Configuration" },
  { id: "send-logs", label: "Send logs" },
  { id: "opentelemetry", label: "OpenTelemetry" },
  { id: "cascade-analysis", label: "Cascade analysis" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-800 dark:border-white/[0.08] dark:bg-[#0a0e17] dark:text-zinc-300">
      <code>{children}</code>
    </pre>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-zinc-600 dark:text-zinc-400">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 glow-orb" />

      <Navbar />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20">
        <div className="mb-12">
          <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
            Documentation
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            PulseIQ.AI SDK
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Install the SDK, stream your logs, and let AI trace errors back to
            their root cause across your services.
          </p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Sidebar */}
          <aside className="lg:w-56 lg:shrink-0">
            <nav className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1 space-y-16">
            <Section id="getting-started" title="Getting started">
              <p>
                PulseIQ.AI ingests logs from your applications and infrastructure,
                then uses AI to identify root causes and map cascade failures across
                services. The fastest way to get started is with our Node.js SDK.
              </p>
              <p>Before you begin, you&apos;ll need:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>A PulseIQ.AI account (sign up from the Dashboard)</li>
                <li>Node.js 18+ or a supported runtime</li>
                <li>Your project API key from the dashboard</li>
              </ul>
            </Section>

            <Section id="install-sdk" title="Install the SDK">
              <p>
                Install the official PulseIQ.AI SDK using your package manager:
              </p>
              <CodeBlock>{`# npm
npm install @pulseiq/sdk

# yarn
yarn add @pulseiq/sdk

# pnpm
pnpm add @pulseiq/sdk`}</CodeBlock>
              <p>
                For Python services, use the Python client:
              </p>
              <CodeBlock>{`pip install pulseiq`}</CodeBlock>
              <p>
                For Go, Rust, or other languages, use our{" "}
                <a
                  href="#opentelemetry"
                  className="text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400"
                >
                  OpenTelemetry exporter
                </a>{" "}
                or the REST API directly.
              </p>
            </Section>

            <Section id="api-key" title="API key">
              <p>
                Generate an API key from{" "}
                <Link
                  href="/dashboard"
                  className="text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400"
                >
                  Dashboard → Settings → API Keys
                </Link>
                . Store it as an environment variable — never commit it to source
                control.
              </p>
              <CodeBlock>{`# .env
PULSEIQ_API_KEY=piq_live_xxxxxxxxxxxxxxxx
PULSEIQ_PROJECT_ID=proj_xxxxxxxx`}</CodeBlock>
            </Section>

            <Section id="configure" title="Configuration">
              <p>
                Initialize the SDK as early as possible in your application entry
                point, before other imports:
              </p>
              <CodeBlock>{`import { PulseIQ } from "@pulseiq/sdk";

PulseIQ.init({
  apiKey: process.env.PULSEIQ_API_KEY,
  projectId: process.env.PULSEIQ_PROJECT_ID,
  service: "api-gateway",       // your service name
  environment: "production",      // production | staging | development
  enableCascadeTracing: true,     // map failure chains across services
});`}</CodeBlock>
              <p>Available configuration options:</p>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/[0.08]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-white/[0.03]">
                      <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                        Option
                      </th>
                      <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                        Required
                      </th>
                      <th className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-200">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                    {[
                      ["apiKey", "Yes", "Your project API key"],
                      ["projectId", "Yes", "Project identifier from the dashboard"],
                      ["service", "Yes", "Logical service name for log grouping"],
                      ["environment", "No", "Deployment environment (default: production)"],
                      ["enableCascadeTracing", "No", "Enable cross-service failure mapping (default: true)"],
                      ["batchSize", "No", "Logs per batch before flush (default: 100)"],
                      ["flushInterval", "No", "Flush interval in ms (default: 5000)"],
                    ].map(([option, required, desc]) => (
                      <tr key={option}>
                        <td className="px-4 py-3 font-mono text-cyan-700 dark:text-cyan-400">
                          {option}
                        </td>
                        <td className="px-4 py-3">{required}</td>
                        <td className="px-4 py-3">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="send-logs" title="Send logs">
              <p>
                The SDK automatically captures unhandled errors and console output.
                You can also send structured logs manually:
              </p>
              <CodeBlock>{`import { PulseIQ } from "@pulseiq/sdk";

// Structured log with metadata
PulseIQ.log("info", "User authenticated", {
  userId: "usr_123",
  method: "oauth",
});

// Error with stack trace — AI will correlate across services
try {
  await processPayment(order);
} catch (error) {
  PulseIQ.captureException(error, {
    orderId: order.id,
    service: "payment-api",
  });
  throw error;
}`}</CodeBlock>
              <p>
                For Express, Fastify, or Next.js, use the framework middleware to
                auto-instrument every request:
              </p>
              <CodeBlock>{`// Express
import express from "express";
import { pulseiqMiddleware } from "@pulseiq/sdk/express";

const app = express();
app.use(pulseiqMiddleware());`}</CodeBlock>
            </Section>

            <Section id="opentelemetry" title="OpenTelemetry">
              <p>
                If you already use OpenTelemetry, point your OTLP exporter to
                PulseIQ.AI — no SDK required:
              </p>
              <CodeBlock>{`# Environment variables
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.pulseiq.ai/v1/traces
OTEL_EXPORTER_OTLP_HEADERS="x-pulseiq-api-key=\${PULSEIQ_API_KEY}"

# Or in your OTel SDK config
exporter: new OTLPTraceExporter({
  url: "https://ingest.pulseiq.ai/v1/traces",
  headers: { "x-pulseiq-api-key": process.env.PULSEIQ_API_KEY },
})`}</CodeBlock>
              <p>
                Supported protocols: OTLP/gRPC, OTLP/HTTP, Fluentd, and syslog.
                See the dashboard for service-specific integration guides.
              </p>
            </Section>

            <Section id="cascade-analysis" title="Cascade analysis">
              <p>
                When <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:bg-white/10 dark:text-zinc-300">enableCascadeTracing</code> is
                on, PulseIQ.AI builds a dependency graph from your logs and traces.
                During an incident it will:
              </p>
              <ol className="list-inside list-decimal space-y-2">
                <li>Identify the first service that emitted an error</li>
                <li>Map downstream failures caused by that root event</li>
                <li>Generate an AI summary with the failure chain and suggested fixes</li>
              </ol>
              <p>
                Ensure each service uses a unique <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:bg-white/10 dark:text-zinc-300">service</code> name
                in its SDK config so the graph resolves correctly.
              </p>
            </Section>

            <Section id="troubleshooting" title="Troubleshooting">
              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/[0.08]">
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">
                    Logs not appearing in the dashboard?
                  </p>
                  <p className="mt-2 text-sm">
                    Verify your API key, check that <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-white/10">PULSEIQ_API_KEY</code> is
                    set in the runtime environment, and confirm outbound HTTPS to{" "}
                    <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                      ingest.pulseiq.ai
                    </code>{" "}
                    is allowed.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/[0.08]">
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">
                    Cascade graph is incomplete?
                  </p>
                  <p className="mt-2 text-sm">
                    All services in the failure chain must report logs with
                    consistent trace IDs. Use OpenTelemetry or enable distributed
                    tracing headers (<code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-white/10">x-trace-id</code>) across
                    service boundaries.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/[0.08]">
                  <p className="font-medium text-zinc-900 dark:text-zinc-200">
                    Need help?
                  </p>
                  <p className="mt-2 text-sm">
                    Open the Dashboard support chat or email{" "}
                    <a
                      href="mailto:support@pulseiq.ai"
                      className="text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400"
                    >
                      support@pulseiq.ai
                    </a>
                    .
                  </p>
                </div>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}
