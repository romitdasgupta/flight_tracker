import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useRef, type ReactNode } from 'react';
import MapView from './MapView';
import type { FlightDetails, FlightState } from '../lib/types';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({
    position,
    children,
    eventHandlers
  }: {
    position: [number, number];
    children?: ReactNode;
    eventHandlers?: { click?: () => void; mouseover?: () => void; mouseout?: () => void };
  }) => (
    <button
      type="button"
      data-testid="marker"
      data-center={`${position[0]},${position[1]}`}
      onClick={() => eventHandlers?.click?.()}
      onMouseOver={() => eventHandlers?.mouseover?.()}
      onMouseOut={() => eventHandlers?.mouseout?.()}
    >
      {children}
    </button>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Polyline: ({ positions }: { positions: [number, number][] }) => (
    <div data-testid="route" data-count={positions.length} />
  )
}));

const mockUseFlights = vi.fn();
vi.mock('../lib/useFlights', () => ({
  useFlights: (...args: unknown[]) => mockUseFlights(...args)
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
    const called = useRef(false);
    useEffect(() => {
      if (!called.current) {
        called.current = true;
        onBboxChange({ minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 });
      }
    }, [onBboxChange]);
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
    mockUseFlights.mockReturnValue({
      flights,
      loading: false,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details,
      loading: false,
      error: null
    });

    render(
      <MapView
        provider={{
          id: 'opensky',
          name: 'OpenSky',
          attribution: 'Data: OpenSky Network',
          getStates: vi.fn()
        }}
      />
    );

    fireEvent.click(screen.getByTestId('marker'));

    // Flight details panel shows route info (origin/destination)
    expect(screen.getAllByText(/KSFO/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/KDEN/).length).toBeGreaterThan(0);
    // Two polylines: route path (2 points) and origin-to-current path (2 points)
    const polylines = screen.getAllByTestId('route');
    expect(polylines.length).toBe(2);
    expect(polylines[0]).toHaveAttribute('data-count', '2'); // route path
    expect(polylines[1]).toHaveAttribute('data-count', '2'); // origin path
  });
});
