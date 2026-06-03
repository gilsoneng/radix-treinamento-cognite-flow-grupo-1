import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { LoadingState } from './loading-state';

describe('LoadingState', () => {
  it('renders the default and custom message', () => {
    const { rerender } = render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<LoadingState message="Checking..." />);
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders the message without a retry button by default', () => {
    render(<ErrorState message="Boom" />);
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('invokes onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Boom" onRetry={onRetry} retryLabel="Try again" />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('EmptyState', () => {
  it('renders title and optional description', () => {
    render(<EmptyState title="Nothing here" description="Add something" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add something')).toBeInTheDocument();
  });
});
