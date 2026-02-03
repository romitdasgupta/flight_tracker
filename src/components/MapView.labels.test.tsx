import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import MapView from './MapView';
import type { FlightState } from '../lib/types';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  CircleMarker: ({ center, children }: { center: [number, number]; children?: ReactNode }) => (
    <div data-testid="marker" data-center={`${center[0]},${center[1]}`}>
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => (
    <div data-testid="label">{children}</div>
  ),
  Polyline: () => null
}));

const mockUseOpenSkyFlights = vi.fn();
vi.mock('../lib/useFlights', () => ({
  useOpenSkyFlights: (...args: unknown[]) => mockUseOpenSkyFlights(...args)
}));

const mockUseFlightDetails = vi.fn();
vi.mock('../lib/useFlightDetails', () => ({
  useFlightDetails: (...args: unknown[]) => mockUseFlightDetails(...args)
}));

vi.mock('../lib/providers', () => ({
  flightDetailsProvider: { getFlightDetails: vi.fn() }
}));

vi.mock('./ViewportObserver', () => ({
  default: ({ onBboxChange }: { onBboxChange: (bbox: any) => void }) => {
    onBboxChange({ minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 });
    return null;
  }
}));

const flights: FlightState[] = [
  {
    icao24: 'abc123',
    callsign: 'TEST123',
    latitude: 12,
    longitude: 22,
    altitude: 1000,
    velocity: 250,
    heading: 90
  }
];

describe('MapView labels', () => {
  it('renders labels for visible flights', () => {
    mockUseOpenSkyFlights.mockReturnValue({
      flights,
      loading: false,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
      loading: false,
      error: null
    });

    render(<MapView />);

    const label = screen.getByTestId('label');
    expect(label).toHaveTextContent('TEST123');
  });
});
