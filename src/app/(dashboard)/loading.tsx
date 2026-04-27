// This file is intentionally minimal.
// Next.js App Router shows this instantly while the new page loads,
// preventing the white flash between sidebar navigation clicks.
// It renders the same muted background as the dashboard so the transition
// is seamless — no content jump, no colour flash.
export default function DashboardLoading() {
  return <div className="flex-1 bg-muted/40 min-h-full" />;
}
