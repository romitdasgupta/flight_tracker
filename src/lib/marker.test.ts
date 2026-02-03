import { describe, expect, it } from 'vitest';
import { createFlightIcon } from './marker';

describe('createFlightIcon', () => {
  it('uses heading for rotation', () => {
    const icon = createFlightIcon(90);
    expect(icon.options.html).toContain('rotate(90deg)');
  });

  it('defaults to 0 when heading is null', () => {
    const icon = createFlightIcon(null);
    expect(icon.options.html).toContain('rotate(0deg)');
  });
});
