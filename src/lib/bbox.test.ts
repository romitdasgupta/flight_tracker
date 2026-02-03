import { describe, expect, it } from 'vitest';
import { bboxFromBounds } from './bbox';

describe('bboxFromBounds', () => {
  it('converts bounds to bbox', () => {
    const bbox = bboxFromBounds({ south: 10, west: 20, north: 30, east: 40 });
    expect(bbox).toEqual({ minLat: 10, minLon: 20, maxLat: 30, maxLon: 40 });
  });

  it('throws on invalid bounds', () => {
    expect(() =>
      bboxFromBounds({ south: 30, west: 20, north: 10, east: 40 })
    ).toThrow('Invalid bounds');
  });
});
