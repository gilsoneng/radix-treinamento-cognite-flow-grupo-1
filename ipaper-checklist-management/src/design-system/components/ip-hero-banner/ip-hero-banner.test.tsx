import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IpHeroBanner } from './ip-hero-banner';

describe('IpHeroBanner', () => {
  it('renders the hero with white logo, app name and page title', () => {
    render(<IpHeroBanner appName="Ipaper Checklist Management" pageTitle="Core Assets" />);

    expect(screen.getByAltText('International Paper')).toBeInTheDocument();
    expect(screen.getByAltText('Radix')).toBeInTheDocument();
    expect(screen.getByText('Ipaper Checklist Management')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Core Assets' })).toBeInTheDocument();
  });
});
