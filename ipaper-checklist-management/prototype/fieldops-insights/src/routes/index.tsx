import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { StatusBadge, SeverityDot } from "@/components/status-badge";
import {
  CHECKLISTS,
  criticalAlerts,
  kpiCounts,
  latestNotOk,
  overdueChecklists,
  statusDistribution,
  trendData,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — InField Checklist Intelligence" },
      { name: "description", content: "Operational status of checklists across International Paper mill areas." },
    ],
  }),
  component: Overview,
});

const total = CHECKLISTS.length;
const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

function Overview() {
  return (
    <>
      <PageHeader
        title="Operations Overview"
        description="Live checklist execution status across all mill areas · Riegelwood · Shift A"
        actions={
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Live · updated 30s ago
          </div>
        }
      />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="To Do" value={kpiCounts.todo} pct={pct(kpiCounts.todo)} trend={2} color="var(--status-todo)" to="/checklists" search={{ status: "todo" }} />
          <KpiCard label="Ongoing" value={kpiCounts.ongoing} pct={pct(kpiCounts.ongoing)} trend={-1} color="var(--status-ongoing)" to="/checklists" search={{ status: "ongoing" }} />
          <KpiCard label="Done" value={kpiCounts.done} pct={pct(kpiCounts.done)} trend={-3} color="var(--status-done)" to="/checklists" search={{ status: "done" }} />
          <KpiCard label="Overdue" value={kpiCounts.overdue} pct={pct(kpiCounts.overdue)} trend={4} color="var(--status-overdue)" to="/checklists" search={{ status: "overdue" }} />
          <KpiCard label="Not OK" value={kpiCounts.notok} pct={pct(kpiCounts.notok)} trend={7} color="var(--status-notok)" to="/checklists" search={{ status: "notok" }} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="OK vs Not OK · last 14 days" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendData} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ok" stackId="a" name="OK" fill="var(--status-ok)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="notok" stackId="a" name="Not OK" fill="var(--status-notok)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Checklist status distribution">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="var(--card)"
                >
                  {statusDistribution.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="-mt-2 grid grid-cols-2 gap-1.5 px-2 pb-2 text-xs">
              {statusDistribution.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1">{d.name}</span>
                  <span className="tabular-nums text-foreground">{d.value}</span>
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card title="Latest Not OK results" linkTo="/checklists" linkSearch={{ status: "notok" }} className="lg:col-span-2">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium">Checklist</th>
                  <th className="px-4 py-2 text-left font-medium">Asset</th>
                  <th className="px-4 py-2 text-left font-medium">Area</th>
                  <th className="px-4 py-2 text-left font-medium">Time</th>
                  <th className="px-4 py-2 text-right font-medium">Not OK</th>
                </tr>
              </thead>
              <tbody>
                {latestNotOk.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-2.5">
                      <Link to="/checklists/$id" params={{ id: c.id }} className="font-medium text-foreground hover:text-primary">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.asset}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.area}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{c.lastExecution}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="rounded-md bg-[color:var(--status-notok)]/15 px-2 py-0.5 text-xs font-semibold text-[color:var(--status-notok)] tabular-nums">
                        {c.notOkCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Critical alerts" linkTo="/alerts">
            <ul className="divide-y divide-border">
              {criticalAlerts.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <SeverityDot severity={a.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-foreground">{a.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {a.area} · {a.time}
                    </div>
                  </div>
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[color:var(--status-overdue)]" />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Overdue checklists" linkTo="/checklists" linkSearch={{ status: "overdue" }}>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left font-medium">Checklist</th>
                <th className="px-4 py-2 text-left font-medium">Area</th>
                <th className="px-4 py-2 text-left font-medium">Asset</th>
                <th className="px-4 py-2 text-left font-medium">Team</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Last execution</th>
              </tr>
            </thead>
            <tbody>
              {overdueChecklists.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-2.5">
                    <Link to="/checklists/$id" params={{ id: c.id }} className="font-medium text-foreground hover:text-primary">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.area}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.asset}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.team}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{c.lastExecution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

export const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card ${className}`}>
      <div className="border-b border-border px-4 py-3 text-sm font-medium">{title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function Card({
  title,
  children,
  linkTo,
  linkSearch,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  linkTo?: string;
  linkSearch?: Record<string, string>;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-card ${className}`}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-sm font-medium">{title}</div>
        {linkTo && (
          <Link to={linkTo} search={linkSearch as never} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
