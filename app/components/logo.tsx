import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md";
};

export function Logo({ href = "/", size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const textSize = size === "sm" ? "text-base" : "text-lg";

  const content = (
    <>
      <span
        className={`flex ${iconSize} items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
          <path
            d="M3 12h4l2-5 4 10 2-5h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={`${textSize} font-semibold tracking-tight`}>
        PulseIQ<span className="text-muted">.AI</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2.5">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-2.5">{content}</div>;
}
