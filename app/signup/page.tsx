import type { Metadata } from "next";
import { AuthShell } from "../components/auth/auth-shell";
import { SignupForm } from "../components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up — PulseIQ.AI",
  description: "Create a PulseIQ.AI account and start AI-powered observability for your systems.",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50 dark:border-white/[0.08] dark:bg-[#0f1219] dark:shadow-black/40">
        <SignupForm />
      </div>
    </AuthShell>
  );
}
