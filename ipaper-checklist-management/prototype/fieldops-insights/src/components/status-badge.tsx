import { cn } from "@/lib/utils";
import type { ChecklistStatus, ResultStatus } from "@/lib/mock-data";

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-[color:var(--status-todo)]/15 text-[color:var(--status-todo)] border-[color:var(--status-todo)]/30",
  ongoing: "bg-[color:var(--status-ongoing)]/15 text-[color:var(--status-ongoing)] border-[color:var(--status-ongoing)]/30",
  done: "bg-[color:var(--status-done)]/15 text-[color:var(--status-done)] border-[color:var(--status-done)]/30",
  overdue: "bg-[color:var(--status-overdue)]/15 text-[color:var(--status-overdue)] border-[color:var(--status-overdue)]/40",
  notok: "bg-[color:var(--status-notok)]/15 text-[color:var(--status-notok)] border-[color:var(--status-notok)]/40",
  ok: "bg-[color:var(--status-ok)]/15 text-[color:var(--status-ok)] border-[color:var(--status-ok)]/30",
  pending: "bg-muted text-muted-foreground border-border",
};

const LABELS: Record<string, string> = {
  todo: "To Do",
  ongoing: "Ongoing",
  done: "Done",
  overdue: "Overdue",
  notok: "Not OK",
  ok: "OK",
  pending: "—",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ChecklistStatus | ResultStatus | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        STATUS_STYLES[status] ?? STATUS_STYLES.pending,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] ?? status}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: string }) {
  const color =
    severity === "critical"
      ? "var(--status-notok)"
      : severity === "high"
        ? "var(--status-overdue)"
        : severity === "medium"
          ? "var(--status-ongoing)"
          : "var(--status-todo)";
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />;
}
