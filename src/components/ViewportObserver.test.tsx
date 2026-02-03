import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import ViewportObserver from './ViewportObserver';

const getBounds = vi.fn();
const getCenter = vi.fn();
let registeredHandlers: Record<string, () => void> = {};

vi.mock('react-leaflet', () => ({
  useMapEvents: (handlers: Record<string, () => void>) => {
    registeredHandlers = handlers;
    return { getBounds, getCenter };
  }
}));

describe('ViewportObserver', () => {
  it('emits bbox on initial mount', () => {
    getBounds.mockReturnValueOnce({
      getSouthWest: () => ({ lat: 10, lng: 20 }),
      getNorthEast: () => ({ lat: 30, lng: 40 })
    });
    getCenter.mockReturnValueOnce({ lat: 20, lng: 30 });

    const onBboxChange = vi.fn();
    render(<ViewportObserver onBboxChange={onBboxChange} />);

    expect(onBboxChange).toHaveBeenCalledWith({
      minLat: 10,
      minLon: 20,
      maxLat: 30,
      maxLon: 40,
      viewCenterLng: 30
    });
  });

  it('emits bbox on moveend and zoomend', () => {
    getBounds.mockReturnValue({
      getSouthWest: () => ({ lat: 5, lng: 6 }),
      getNorthEast: () => ({ lat: 7, lng: 8 })
    });
    getCenter.mockReturnValue({ lat: 6, lng: 7 });

    const onBboxChange = vi.fn();
    render(<ViewportObserver onBboxChange={onBboxChange} />);

    registeredHandlers.moveend();
    registeredHandlers.zoomend();

    expect(onBboxChange).toHaveBeenCalledTimes(3);
  });

  it('wraps longitudes correctly and detects dateline crossing', () => {
    // Simulating a view that crosses the dateline (west at 170, east at -170)
    getBounds.mockReturnValueOnce({
      getSouthWest: () => ({ lat: 30, lng: 170 }),
      getNorthEast: () => ({ lat: 50, lng: 190 }) // 190 wraps to -170
    });
    getCenter.mockReturnValueOnce({ lat: 40, lng: 180 });

    const onBboxChange = vi.fn();
    render(<ViewportObserver onBboxChange={onBboxChange} />);

    expect(onBboxChange).toHaveBeenCalledWith({
      minLat: 30,
      minLon: 170,
      maxLat: 50,
      maxLon: -170, // 190 wrapped to -170
      wrapsDateline: true,
      viewCenterLng: 180
    });
  });
});
