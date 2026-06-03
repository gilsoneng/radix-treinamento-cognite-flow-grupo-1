import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileImage, Paperclip } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CHECKLISTS, TASK_RESULTS, trendData } from "@/lib/mock-data";
import { tooltipStyle } from "./index";

export const Route = createFileRoute("/checklists/$id")({
  loader: ({ params }) => {
    const checklist = CHECKLISTS.find((c) => c.id === params.id);
    if (!checklist) throw notFound();
    return { checklist };
  },
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Checklist not found.</div>
  ),
  component: ChecklistDetail,
});

function ChecklistDetail() {
  const { checklist } = Route.useLoaderData();
  const okCount = TASK_RESULTS.filter((t) => t.status === "ok").length;
  const notOkCount = TASK_RESULTS.filter((t) => t.status === "notok").length;
  const progress = Math.round((checklist.completed / checklist.totalTasks) * 100);

  return (
    <>
      <PageHeader
        title={checklist.name}
        description={`${checklist.id} · ${checklist.area} · ${checklist.asset}`}
        actions={
          <Link to="/checklists" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Meta label="Status"><StatusBadge status={checklist.status} /></Meta>
          <Meta label="Responsible team">{checklist.team}</Meta>
          <Meta label="Last execution"><span className="tabular-nums">{checklist.lastExecution}</span></Meta>
          <Meta label="Completion">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent">
                <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{progress}%</span>
            </div>
          </Meta>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SummaryStat label="OK tasks" value={okCount} color="var(--status-ok)" />
          <SummaryStat label="Not OK tasks" value={notOkCount} color="var(--status-notok)" />
          <SummaryStat label="Total tasks" value={TASK_RESULTS.length} color="var(--status-ongoing)" />
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-sm font-medium">Task results</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium">Task</th>
                  <th className="px-4 py-2 text-left font-medium">Expected</th>
                  <th className="px-4 py-2 text-left font-medium">Actual</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Time</th>
                  <th className="px-4 py-2 text-left font-medium">Comment</th>
                  <th className="px-4 py-2 text-left font-medium">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {TASK_RESULTS.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0 align-top">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.expected}</td>
                    <td className={t.status === "notok" ? "px-4 py-3 font-semibold text-[color:var(--status-notok)]" : "px-4 py-3"}>
                      {t.actual}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{t.time}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.comment || "—"}</td>
                    <td className="px-4 py-3">
                      {t.evidence ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                          <FileImage className="h-3.5 w-3.5" /> photo.jpg
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
                          <Paperclip className="h-3.5 w-3.5" /> —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card lg:col-span-2">
            <div className="border-b border-border px-4 py-3 text-sm font-medium">Historical trend · this checklist</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendData} stackOffset="sign">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                  <Bar dataKey="ok" stackId="a" name="OK" fill="var(--status-ok)" />
                  <Bar dataKey="notok" stackId="a" name="Not OK" fill="var(--status-notok)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3 text-sm font-medium">Previous Not OK occurrences</div>
              <ul className="divide-y divide-border text-sm">
                {[
                  { d: "May 28 · 08:19", t: "Vibration RMS · 6.1 mm/s" },
                  { d: "May 26 · 08:22", t: "Vibration RMS · 5.8 mm/s" },
                  { d: "May 23 · 08:15", t: "Bearing temp · 79°C" },
                  { d: "May 19 · 08:30", t: "Noise · abnormal" },
                ].map((x) => (
                  <li key={x.d} className="px-4 py-2.5">
                    <div className="text-xs text-muted-foreground tabular-nums">{x.d}</div>
                    <div>{x.t}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3 text-sm font-medium">Related alerts</div>
              <ul className="divide-y divide-border text-sm">
                <li className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--status-notok)]" />
                    <span className="text-xs uppercase tracking-wider text-[color:var(--status-notok)]">Critical</span>
                  </div>
                  <div className="mt-1">Pump vibration repeats &gt; 3× / 24h</div>
                </li>
                <li className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--status-overdue)]" />
                    <span className="text-xs uppercase tracking-wider text-[color:var(--status-overdue)]">High</span>
                  </div>
                  <div className="mt-1">Bearing temperature trending up — 3rd shift</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-sm">{children}</div>
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
