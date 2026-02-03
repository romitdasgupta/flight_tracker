import type { Bbox, BoundsLike } from './types';

export function bboxFromBounds(bounds: BoundsLike): Bbox {
  const { south, west, north, east } = bounds;
  if (south > north || west > east) {
    throw new Error('Invalid bounds');
  }
  return { minLat: south, minLon: west, maxLat: north, maxLon: east };
}
