import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { buildChecklistKpiInsights } from '../../../domain/kpi-insight.rules';
import { EMPTY_KPI_COUNTS } from '../../../domain/checklist-kpi.model';

import { KpiCard } from './kpi-card';

const defaultInsights = buildChecklistKpiInsights(
  { todo: 12, ongoing: 4, done: 183, overdue: 2, notok: 7 },
  EMPTY_KPI_COUNTS,
  true,
);

describe(KpiCard.name, () => {
  it('renders label, value, and delta vs previous shift', () => {
    render(
      <KpiCard
        bucket="todo"
        value={12}
        insight={defaultInsights.todo}
      />,
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText(/vs previous shift/i)).toBeInTheDocument();
  });

  it('shows critical badge for overdue alert state', () => {
    render(
      <KpiCard
        bucket="overdue"
        value={2}
        insight={{
          delta: 2,
          trafficLight: 'critical',
          deltaLabel: '▲ 2 vs previous shift',
        }}
      />,
    );
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <KpiCard
        bucket="notok"
        value={3}
        insight={defaultInsights.notok}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Not OK/i }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
