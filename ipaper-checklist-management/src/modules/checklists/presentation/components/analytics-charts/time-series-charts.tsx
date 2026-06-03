import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MeasurementTrendPoint, TimeSeriesKpiPoint } from '../../../domain/time-series-trend.model';
import { ChartCard } from './chart-card';

const TOOLTIP_STYLE = {
  background: 'var(--card-background)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
};

export type TimeSeriesChartsProps = {
  routeSnapshots: readonly TimeSeriesKpiPoint[];
  measurementTrends: readonly MeasurementTrendPoint[];
};

export function TimeSeriesCharts({ routeSnapshots, measurementTrends }: TimeSeriesChartsProps) {
  const alarmCandidates = measurementTrends
    .filter((point) => point.predictedDaysToAlarm !== null && point.predictedDaysToAlarm <= 14)
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Route Not OK rate by period (CDF KPI snapshots)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={[...routeSnapshots]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="%" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="notOkRate" name="% Not OK" fill="var(--ip-teal)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Checklists completed per period">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={[...routeSnapshots]}>
            <defs>
              <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--ip-clover)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--ip-clover)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="totalChecklists"
              stroke="var(--ip-clover)"
              fill="url(#gCompleted)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Measurement exceedances (30d)" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={measurementTrends.slice(0, 12).map((point) => ({
              label: point.label,
              exceedanceCount30d: point.exceedanceCount30d,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={10} interval={0} angle={-12} textAnchor="end" height={70} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="exceedanceCount30d"
              stroke="var(--ip-yellow)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {alarmCandidates.length > 0 ? (
        <ChartCard title="Predicted days to alarm (≤ 14d)" className="lg:col-span-2">
          <ul className="m-0 flex flex-col gap-2 p-1 text-sm">
            {alarmCandidates.map((point) => (
              <li
                key={point.externalId}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <span className="truncate pr-4">{point.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-warning-foreground">
                  {point.predictedDaysToAlarm}d
                </span>
              </li>
            ))}
          </ul>
        </ChartCard>
      ) : null}
    </div>
  );
}
