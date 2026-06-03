import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { notOkByArea, notOkByChecklist, recurringNotOk, trendData } from "@/lib/mock-data";
import { tooltipStyle } from "./index";

export const Route = createFileRoute("/task-results")({
  head: () => ({ meta: [{ title: "Task Results — InField" }] }),
  component: TaskResults,
});

function TaskResults() {
  const totalOk = trendData.reduce((s, d) => s + d.ok, 0);
  const totalNotOk = trendData.reduce((s, d) => s + d.notok, 0);
  const total = totalOk + totalNotOk;
  const pct = Math.round((totalNotOk / total) * 100);

  return (
    <>
      <PageHeader title="Task Results Analytics" description="OK vs Not OK outcomes across checklists, areas and assets" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="Total tasks" value={total} pct="last 14d" trend={3} color="var(--chart-4)" />
          <KpiCard label="OK" value={totalOk} pct={`${100 - pct}%`} trend={-2} color="var(--status-ok)" />
          <KpiCard label="Not OK" value={totalNotOk} pct={`${pct}%`} trend={6} color="var(--status-notok)" />
          <KpiCard label="Not OK rate" value={`${pct}%`} pct="of all tasks" trend={4} color="var(--status-overdue)" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="OK vs Not OK over time">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ok" stackId="a" name="OK" fill="var(--status-ok)" />
                <Bar dataKey="notok" stackId="a" name="Not OK" fill="var(--status-notok)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Not OK by checklist">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={notOkByChecklist} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="checklist" stroke="var(--muted-foreground)" fontSize={11} width={150} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                <Bar dataKey="count" fill="var(--status-notok)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Not OK by area">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={notOkByArea}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="area" stroke="var(--muted-foreground)" fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                <Bar dataKey="count" fill="var(--status-overdue)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Most frequent Not OK tasks">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={recurringNotOk.slice(0, 6)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="task" stroke="var(--muted-foreground)" fontSize={11} width={160} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                <Bar dataKey="occurrences" fill="var(--chart-4)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-sm font-medium">Recurring Not OK tasks</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium">Task</th>
                  <th className="px-4 py-2 text-left font-medium">Checklist</th>
                  <th className="px-4 py-2 text-left font-medium">Asset</th>
                  <th className="px-4 py-2 text-left font-medium">Area</th>
                  <th className="px-4 py-2 text-right font-medium">Occurrences (30d)</th>
                  <th className="px-4 py-2 text-left font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {recurringNotOk.map((r) => (
                  <tr key={r.task} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-medium">{r.task}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.checklist}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.asset}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.area}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="rounded-md bg-[color:var(--status-notok)]/15 px-2 py-0.5 text-xs font-semibold text-[color:var(--status-notok)] tabular-nums">{r.occurrences}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3 text-sm font-medium">{title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}
