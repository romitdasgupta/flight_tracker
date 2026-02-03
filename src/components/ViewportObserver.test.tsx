import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import ViewportObserver from './ViewportObserver';

const getBounds = vi.fn();
let registeredHandlers: Record<string, () => void> = {};

vi.mock('react-leaflet', () => ({
  useMapEvents: (handlers: Record<string, () => void>) => {
    registeredHandlers = handlers;
    return { getBounds };
  }
}));

describe('ViewportObserver', () => {
  it('emits bbox on initial mount', () => {
    getBounds.mockReturnValueOnce({
      getSouthWest: () => ({ lat: 10, lng: 20 }),
      getNorthEast: () => ({ lat: 30, lng: 40 })
    });

    const onBboxChange = vi.fn();
    render(<ViewportObserver onBboxChange={onBboxChange} />);

    expect(onBboxChange).toHaveBeenCalledWith({
      minLat: 10,
      minLon: 20,
      maxLat: 30,
      maxLon: 40
    });
  });

  it('emits bbox on moveend and zoomend', () => {
    getBounds.mockReturnValue({
      getSouthWest: () => ({ lat: 5, lng: 6 }),
      getNorthEast: () => ({ lat: 7, lng: 8 })
    });

    const onBboxChange = vi.fn();
    render(<ViewportObserver onBboxChange={onBboxChange} />);

    registeredHandlers.moveend();
    registeredHandlers.zoomend();

    expect(onBboxChange).toHaveBeenCalledTimes(3);
  });
});
