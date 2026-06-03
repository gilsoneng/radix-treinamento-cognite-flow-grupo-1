import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageShell } from './page-shell';

describe('PageShell', () => {
  it('renders the IP logo, app name, page title, content and app footer', () => {
    render(
      <PageShell appName="Ipaper Checklist Management" pageTitle="Core Assets">
        <p>Page body</p>
      </PageShell>,
    );

    expect(screen.getByAltText('International Paper')).toBeInTheDocument();
    expect(screen.getByAltText('Radix')).toBeInTheDocument();
    expect(screen.getByAltText('Powered by Radix')).toBeInTheDocument();
    expect(
      screen.getByText(`© ${new Date().getFullYear()} International Paper. All rights reserved.`),
    ).toBeInTheDocument();
    expect(screen.getByText('Ipaper Checklist Management')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Core Assets' })).toBeInTheDocument();
    expect(screen.getByText('Page body')).toBeInTheDocument();
  });
});
