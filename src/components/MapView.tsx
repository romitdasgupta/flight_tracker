import { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import type { Bbox } from '../lib/types';
import { useOpenSkyFlights } from '../lib/useFlights';
import { filterFlightsByBbox } from '../lib/filter';
import ViewportObserver from './ViewportObserver';

const DEFAULT_CENTER: [number, number] = [37.773972, -122.431297];
const DEFAULT_ZOOM = 5;

export default function MapView() {
  const [bbox, setBbox] = useState<Bbox | null>(null);
  const { flights, loading, error } = useOpenSkyFlights({ bbox });

  const visibleFlights = useMemo(() => {
    if (!bbox) return [];
    return filterFlightsByBbox(flights, bbox);
  }, [bbox, flights]);

  return (
    <div
      data-testid="map-root"
      style={{ height: '100%', width: '100%', position: 'relative' }}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewportObserver onBboxChange={setBbox} />

        {visibleFlights.map((flight) => (
          <CircleMarker
            key={flight.icao24}
            center={[flight.latitude ?? 0, flight.longitude ?? 0]}
            radius={4}
            pathOptions={{ color: '#1f4b99', fillColor: '#1f4b99' }}
          />
        ))}
      </MapContainer>

      {loading && (
        <div style={overlayStyle} role="status">
          Loading flights...
        </div>
      )}
      {error && (
        <div style={overlayStyle} role="alert">
          Failed to load flights.
        </div>
      )}
      <div style={attributionStyle}>
        Data: OpenSky Network
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  padding: '6px 10px',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 4,
  fontSize: 12
};

const attributionStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  bottom: 12,
  padding: '4px 8px',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 4,
  fontSize: 11
};
