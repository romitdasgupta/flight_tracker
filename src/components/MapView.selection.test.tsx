import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import MapView from './MapView';
import type { FlightDetails, FlightState } from '../lib/types';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  CircleMarker: ({
    center,
    children,
    eventHandlers
  }: {
    center: [number, number];
    children?: ReactNode;
    eventHandlers?: { click?: () => void };
  }) => (
    <button
      type="button"
      data-testid="marker"
      data-center={`${center[0]},${center[1]}`}
      onClick={() => eventHandlers?.click?.()}
    >
      {children}
    </button>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Polyline: ({ positions }: { positions: [number, number][] }) => (
    <div data-testid="route" data-count={positions.length} />
  )
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

const details: FlightDetails = {
  icao24: 'abc123',
  callsign: 'TEST123',
  origin: { code: 'KSFO', name: 'San Francisco Intl', lat: 0, lon: 0 },
  destination: { code: 'KDEN', name: 'Denver Intl', lat: 1, lon: 1 },
  path: [
    { lat: 0, lon: 0 },
    { lat: 1, lon: 1 }
  ]
};

describe('MapView selection', () => {
  it('shows details panel and route on marker click', () => {
    mockUseOpenSkyFlights.mockReturnValue({
      flights,
      loading: false,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details,
      loading: false,
      error: null
    });

    render(<MapView />);

    fireEvent.click(screen.getByTestId('marker'));

    expect(screen.getByText('TEST123')).toBeInTheDocument();
    expect(screen.getByTestId('route')).toHaveAttribute('data-count', '2');
  });
});
