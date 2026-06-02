import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppFooter } from './app-footer';

describe('AppFooter', () => {
  it('renders the Radix badge and copyright notice', () => {
    render(<AppFooter />);

    expect(screen.getByAltText('Powered by Radix')).toBeInTheDocument();
    expect(
      screen.getByText(`© ${new Date().getFullYear()} International Paper. All rights reserved.`),
    ).toBeInTheDocument();
  });
});
