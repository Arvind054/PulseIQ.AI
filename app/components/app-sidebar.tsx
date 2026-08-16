"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  {
    label: "Projects",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Documentation",
    href: "/docs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-[color:var(--card-border)] bg-[color:var(--sidebar)]">
      <div className="flex h-14 items-center border-b border-[color:var(--card-border)] px-4">
        <Logo href="/dashboard" size="sm" />
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname.startsWith("/project/")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-100 font-medium text-foreground dark:bg-zinc-800"
                  : "text-muted hover:bg-zinc-50 hover:text-foreground dark:hover:bg-zinc-800/50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[color:var(--card-border)] p-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session?.user?.name || "User"}</p>
            <p className="truncate text-xs text-muted">{session?.user?.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={() => signOut({ fetchOptions: { onSuccess: () => (window.location.href = "/") } })}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-zinc-50 hover:text-foreground dark:hover:bg-zinc-800/50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
