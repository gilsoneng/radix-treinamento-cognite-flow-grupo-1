import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { CoreAsset } from '../../../domain/core-asset.model';
import { UseHealthViewModelContext } from '../../view-models/use-health.view-model';

import { HealthPage } from './health.page';

function fakeQuery(overrides: Record<string, unknown>) {
  return {
    isPending: false,
    isError: false,
    data: undefined,
    refetch: vi.fn(),
    ...overrides,
  };
}

function renderPage(query: ReturnType<typeof fakeQuery>) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <UseHealthViewModelContext.Provider value={{ useHealthQuery: () => query as never }}>
      {children}
    </UseHealthViewModelContext.Provider>
  );
  return render(<HealthPage />, { wrapper: Wrapper });
}

describe('HealthPage', () => {
  it('shows the loading state', () => {
    renderPage(fakeQuery({ isPending: true }));
    expect(screen.getByText('Loading Core assets...')).toBeInTheDocument();
  });

  it('shows the error state with retry', () => {
    renderPage(fakeQuery({ isError: true }));
    expect(screen.getByText('Failed to load Core assets')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('shows the empty state when there are no assets', () => {
    renderPage(fakeQuery({ data: [] }));
    expect(screen.getByText('No assets found')).toBeInTheDocument();
  });

  it('shows the asset list when data is available', () => {
    const data: CoreAsset[] = [
      {
        space: 'asset-space',
        externalId: 'asset-1',
        name: 'Pump A',
        description: 'Main feed pump',
      },
    ];
    renderPage(fakeQuery({ data }));
    expect(screen.getByText('Cognite Core assets')).toBeInTheDocument();
    expect(screen.getByText('Pump A')).toBeInTheDocument();
  });
});
