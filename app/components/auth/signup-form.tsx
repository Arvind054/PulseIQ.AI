"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthDivider } from "./auth-divider";
import { GoogleButton } from "./google-button";
import { signUp, useSession } from "@/lib/auth-client";
const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, isPending } = useSession();

  // If session already exists return to daasboard;
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    };
    return;
  }, [isPending, session]);

  useEffect(() => {
    const handleFocus = () => {
      // Small delay to allow OAuth redirect to complete if successful
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Function to Handle the submit for signup
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return;
    }

    setIsLoading(true)

    try {
      const { error } = await signUp.email({
        name,
        email,
        password,
      })

      if (error) {
        setError(error.message || "Failed to create account")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Start monitoring logs and tracing root causes in minutes
        </p>
      </div>

      <GoogleButton label="Sign up with Google" />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                  <path
                    d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10 10 0 0112 5c5 0 9.3 3.1 11 7-1 2.2-2.8 4-5 5.1M6.1 6.1C3.5 7.6 1.7 9.9 1 12c1.7 3.9 6 7 11 7 1.4 0 2.7-.3 3.9-.7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">
            Must be at least 8 characters
          </p>
        </div>

        <button
          type="submit"
          disabled = {isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40"
        >
         {isLoading ? "Creating Account ...": " Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-500">
        By signing up, you agree to our{" "}
        <Link href="#" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-cyan-600 hover:underline dark:text-cyan-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
