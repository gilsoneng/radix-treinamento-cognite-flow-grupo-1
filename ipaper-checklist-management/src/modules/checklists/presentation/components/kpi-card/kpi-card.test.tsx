import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { KpiCard } from './kpi-card';

describe(KpiCard.name, () => {
  it('renders label, value, and percentage', () => {
    render(<KpiCard bucket="todo" value={12} percentage="24%" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('24% of total')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<KpiCard bucket="notok" value={3} percentage="6%" onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /Not OK/i }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
