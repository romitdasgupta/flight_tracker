import type { FlightDetails, FlightState } from '../lib/types';

type FlightDetailsPanelProps = {
  flight: FlightState;
  details: FlightDetails | null;
  loading: boolean;
  error: Error | null;
};

export default function FlightDetailsPanel({
  flight,
  details,
  loading,
  error
}: FlightDetailsPanelProps) {
  if (loading) {
    return (
      <div style={panelStyle} role="status">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={panelStyle} role="alert">
        Failed to load details.
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={titleStyle}>{flight.callsign ?? flight.icao24}</div>
      <div>Altitude: {flight.altitude ?? 'N/A'} ft</div>
      <div>Speed: {flight.velocity ?? 'N/A'} kt</div>
      <div>Heading: {flight.heading ?? 'N/A'}°</div>
      <div>
        Route:{' '}
        {details?.origin ? details.origin.code : '???'} →{' '}
        {details?.destination ? details.destination.code : '???'}
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  top: 12,
  padding: '10px 12px',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 6,
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  fontSize: 12,
  minWidth: 200
};

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 6
};
