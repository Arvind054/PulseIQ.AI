
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
const severityRules: Record<Severity, string[]> = {
  CRITICAL: [
    "panic",
    "fatal",
    "segmentation fault",
    "out of memory",
    "oom",
    "database corruption",
    "database corrupted",
    "kernel panic",
    "system crash",
    "service unavailable",
    "authentication bypass",
    "data loss"
  ],

  HIGH: [
    "connection refused",
    "connection timeout",
    "redis timeout",
    "redis unavailable",
    "database timeout",
    "deadlock",
    "memory leak",
    "disk full",
    "unable to connect",
    "too many requests",
    "failed to connect"
  ],

  MEDIUM: [
    "validation failed",
    "retry failed",
    "cache miss",
    "request timeout",
    "dependency unavailable",
    "network error",
    "permission denied",
    "access denied"
  ],

  LOW: []
};

export function detectSeverity(
  message: string
): Severity {

  const text = `${message}`.toLowerCase();

  for (const keyword of severityRules.CRITICAL) {
    if (text.includes(keyword))
      return "CRITICAL";
  }

  for (const keyword of severityRules.HIGH) {
    if (text.includes(keyword))
      return "HIGH";
  }

  for (const keyword of severityRules.MEDIUM) {
    if (text.includes(keyword))
      return "MEDIUM";
  }

  return "LOW";
}