import type { Bbox, BoundsLike } from './types';

export function bboxFromBounds(bounds: BoundsLike): Bbox {
  const { south, west, north, east } = bounds;
  if (south > north) {
    throw new Error('Invalid bounds');
  }
  const wrapsDateline = west > east;
  return {
    minLat: south,
    minLon: west,
    maxLat: north,
    maxLon: east,
    ...(wrapsDateline ? { wrapsDateline } : {})
  };
}
