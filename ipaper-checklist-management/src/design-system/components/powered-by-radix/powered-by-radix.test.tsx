import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PoweredByRadix } from './powered-by-radix';

describe('PoweredByRadix', () => {
  it('renders the powered by Radix badge', () => {
    render(<PoweredByRadix />);
    expect(screen.getByAltText('Powered by Radix')).toBeInTheDocument();
  });
});
