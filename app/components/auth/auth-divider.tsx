export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[color:var(--card-border)]" />
      </div>
      <div className="relative flex justify-center text-xs text-muted">
        <span className="bg-background px-3">or</span>
      </div>
    </div>
  );
}
