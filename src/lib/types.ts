export type Bbox = {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
};

export type FlightState = {
  icao24: string;
  callsign: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
};

export type BoundsLike = {
  south: number;
  west: number;
  north: number;
  east: number;
};
