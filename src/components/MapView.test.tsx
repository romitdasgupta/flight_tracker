import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import MapView from './MapView';

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
    <div
      data-testid="marker"
      data-center={`${center[0]},${center[1]}`}
      onClick={() => eventHandlers?.click?.()}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <span>{children}</span>,
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

describe('MapView', () => {
  beforeEach(() => {
    mockUseOpenSkyFlights.mockReset();
    mockUseFlightDetails.mockReset();
  });

  it('renders markers for flights inside viewport', () => {
    mockUseOpenSkyFlights.mockReturnValue({
      flights: [
        {
          icao24: 'abc123',
          callsign: 'TEST123',
          latitude: 12,
          longitude: 22,
          altitude: 1000,
          velocity: 200,
          heading: 90
        },
        {
          icao24: 'def456',
          callsign: 'TEST456',
          latitude: 50,
          longitude: 60,
          altitude: 1000,
          velocity: 200,
          heading: 90
        }
      ],
      loading: false,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
      loading: false,
      error: null
    });

    render(<MapView />);

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
    expect(markers[0]).toHaveAttribute('data-center', '12,22');
  });

  it('shows loading state', () => {
    mockUseOpenSkyFlights.mockReturnValue({
      flights: [],
      loading: true,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
      loading: false,
      error: null
    });

    render(<MapView />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading flights...');
  });

  it('shows error state', () => {
    mockUseOpenSkyFlights.mockReturnValue({
      flights: [],
      loading: false,
      error: new Error('nope')
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
      loading: false,
      error: null
    });

    render(<MapView />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load flights.');
  });

  it('renders OpenSky attribution', () => {
    mockUseOpenSkyFlights.mockReturnValue({
      flights: [],
      loading: false,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
      loading: false,
      error: null
    });

    render(<MapView />);
    expect(screen.getByText('Data: OpenSky Network')).toBeInTheDocument();
  });
});
