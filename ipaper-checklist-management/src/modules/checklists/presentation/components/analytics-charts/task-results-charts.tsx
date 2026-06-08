import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TaskResultAnalyticsBundle } from '../../../domain/task-result-analytics.model';
import { ChartCard } from './chart-card';

const TOOLTIP_STYLE = {
  background: 'var(--card-background)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

export type TaskResultsChartsProps = {
  data: TaskResultAnalyticsBundle;
};

export function TaskResultsCharts({ data }: TaskResultsChartsProps) {
  const total = data.summary.ok + data.summary.nok + data.summary.observation;
  const pct = total > 0 ? Math.round((data.summary.nok / total) * 100) : 0;
  const hasTrend = data.trend.some((point) => point.ok > 0 || point.notok > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiMini label="Total tasks" value={String(total)} />
        <KpiMini label="OK" value={String(data.summary.ok)} />
        <KpiMini label="Not OK" value={String(data.summary.nok)} />
        <KpiMini label="Not OK rate" value={`${pct}%`} />
      </div>
      {data.summary.observation > 0 && data.summary.ok === 0 && data.summary.nok === 0 ? (
        <p className="m-0 text-xs text-muted-foreground">
          All items are unclassified (missing status/note from CDF). Reload after ingest or check DM property mapping.
        </p>
      ) : null}
      {!hasTrend && total > 0 ? (
        <p className="m-0 text-xs text-muted-foreground">
          No dated results in the selected period — try &quot;All time&quot;.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="OK vs Not OK over time">
          <div className="ip-chart-shell">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[...data.trend]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="ok" name="OK" fill="var(--ip-clover)" stackId="a" />
              <Bar
                dataKey="notok"
                name="Not OK"
                fill="var(--ip-error)"
                stackId="a"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Not OK by checklist">
          <div className="ip-chart-shell">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[...data.notOkByChecklist]} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickFormatter={(value: string) =>
                  value.length > 18 ? `${value.slice(0, 18)}…` : value
                }
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="var(--destructive-background, #c53030)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Not OK by route / area">
          <div className="ip-chart-shell">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[...data.notOkByArea]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="var(--ip-yellow)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="% Not OK over time">
          <div className="ip-chart-shell">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={[...data.trend]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="pctNotOk"
                stroke="var(--ip-error)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function KpiMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
