import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number | string;
  pct?: string;
  trend?: number; // positive = up
  color?: string; // css var
  to?: string;
  search?: Record<string, string>;
}

export function KpiCard({ label, value, pct, trend = 0, color = "var(--primary)", to, search }: KpiCardProps) {
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor =
    trend > 0 ? "text-[color:var(--status-notok)]" : trend < 0 ? "text-[color:var(--status-ok)]" : "text-muted-foreground";

  const inner = (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition hover:border-primary/50">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-3xl font-semibold tabular-nums text-foreground">{value}</div>
        {pct && <div className="text-sm text-muted-foreground">{pct}</div>}
      </div>
      <div className={cn("mt-2 flex items-center gap-1 text-xs", trendColor)}>
        <TrendIcon className="h-3.5 w-3.5" />
        <span>
          {trend > 0 ? "+" : ""}
          {trend}% vs last week
        </span>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 opacity-60"
        style={{ background: color }}
      />
    </div>
  );

  if (to) {
    return (
      <Link to={to} search={search as never} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
