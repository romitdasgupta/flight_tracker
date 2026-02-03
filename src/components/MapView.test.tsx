import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useEffect, useRef, type ReactNode } from 'react';
import MapView from './MapView';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({
    position,
    children,
    eventHandlers,
    icon
  }: {
    position: [number, number];
    children?: ReactNode;
    eventHandlers?: { click?: () => void; mouseover?: () => void; mouseout?: () => void };
    icon?: { options?: { html?: string } };
  }) => (
    <div
      data-testid="marker"
      data-center={`${position[0]},${position[1]}`}
      data-icon-html={icon?.options?.html ?? ''}
      onClick={() => eventHandlers?.click?.()}
      onMouseOver={() => eventHandlers?.mouseover?.()}
      onMouseOut={() => eventHandlers?.mouseout?.()}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Polyline: () => null
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

describe('MapView', () => {
  beforeEach(() => {
    mockUseFlights.mockReset();
    mockUseFlightDetails.mockReset();
  });

  it('renders markers for flights inside viewport', () => {
    mockUseFlights.mockReturnValue({
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

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(1);
    expect(markers[0]).toHaveAttribute('data-center', '12,22');
    expect(markers[0]).toHaveAttribute('data-icon-html');
    expect(markers[0].getAttribute('data-icon-html')).toContain('rotate(90deg)');
  });

  it('shows loading state', () => {
    mockUseFlights.mockReturnValue({
      flights: [],
      loading: true,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
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
    expect(screen.getByRole('status')).toHaveTextContent('Loading flights...');
  });

  it('shows error state', () => {
    mockUseFlights.mockReturnValue({
      flights: [],
      loading: false,
      error: new Error('nope')
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
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
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load flights.');
  });

  it('renders OpenSky attribution', () => {
    mockUseFlights.mockReturnValue({
      flights: [],
      loading: false,
      error: null
    });

    mockUseFlightDetails.mockReturnValue({
      details: null,
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
    expect(screen.getByText('Data: OpenSky Network')).toBeInTheDocument();
  });
});
