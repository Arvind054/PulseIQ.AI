import type { Metadata } from "next";
import { AuthShell } from "../components/auth/auth-shell";
import { LoginForm } from "../components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — PulseIQ.AI",
  description: "Sign in to your PulseIQ.AI account to monitor logs and trace root causes.",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50 dark:border-white/[0.08] dark:bg-[#0f1219] dark:shadow-black/40">
        <LoginForm />
      </div>
    </AuthShell>
  );
}
