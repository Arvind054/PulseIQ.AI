import type { Metadata } from "next";
import { AuthShell } from "../components/auth/auth-shell";
import { SignupForm } from "../components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up — PulseIQ.AI",
  description: "Create a PulseIQ.AI account.",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
