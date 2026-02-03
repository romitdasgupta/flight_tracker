import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFlightDetails } from './useFlightDetails';
import type { FlightDetailsProvider } from './types';

const provider: FlightDetailsProvider = {
  getFlightDetails: vi.fn(async (icao24: string) => ({
    icao24,
    callsign: 'TEST123',
    origin: { code: 'KSFO', name: 'San Francisco Intl', lat: 0, lon: 0 },
    destination: { code: 'KDEN', name: 'Denver Intl', lat: 1, lon: 1 },
    path: []
  }))
};

describe('useFlightDetails', () => {
  it('does not fetch when icao24 is null', () => {
    const { result } = renderHook(() => useFlightDetails(null, provider));

    expect(result.current.details).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(provider.getFlightDetails).not.toHaveBeenCalled();
  });

  it('fetches details when icao24 is set', async () => {
    const { result } = renderHook(() => useFlightDetails('abc123', provider));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.details?.icao24).toBe('abc123');
    expect(result.current.error).toBeNull();
    expect(provider.getFlightDetails).toHaveBeenCalledWith('abc123');
  });

  it('exposes errors from provider', async () => {
    const errorProvider: FlightDetailsProvider = {
      getFlightDetails: vi.fn(async () => {
        throw new Error('boom');
      })
    };

    const { result } = renderHook(() => useFlightDetails('abc123', errorProvider));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('boom');
  });
});
