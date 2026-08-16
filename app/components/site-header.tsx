"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Docs", href: "/docs" },
];

export function SiteHeader() {
  const { data: session, isPending } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--card-border)] bg-[color:var(--nav-bg)] backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground sm:inline-block"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href={!isPending && session?.user ? "/dashboard" : "/login"}
            className="ml-2 inline-flex items-center rounded-md bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {!isPending && session?.user ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
