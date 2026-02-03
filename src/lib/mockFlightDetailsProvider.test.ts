import { describe, expect, it } from 'vitest';
import { createMockFlightDetailsProvider } from './mockFlightDetailsProvider';

describe('createMockFlightDetailsProvider', () => {
  it('returns details for known flights', async () => {
    const provider = createMockFlightDetailsProvider(0);
    const details = await provider.getFlightDetails('abc123');

    expect(details).not.toBeNull();
    expect(details?.origin?.code).toBe('KSFO');
    expect(details?.destination?.code).toBe('KDEN');
    expect(details?.path.length).toBeGreaterThan(1);
  });

  it('returns null for unknown flights', async () => {
    const provider = createMockFlightDetailsProvider(0);
    const details = await provider.getFlightDetails('unknown');

    expect(details).toBeNull();
  });
});
