import { useCallback, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import type { Bbox } from '../lib/types';
import { bboxFromBounds } from '../lib/bbox';

type ViewportObserverProps = {
  onBboxChange: (bbox: Bbox) => void;
};

export default function ViewportObserver({ onBboxChange }: ViewportObserverProps) {
  const map = useMapEvents({
    moveend: () => {
      emitBbox();
    },
    zoomend: () => {
      emitBbox();
    }
  });

  const emitBbox = useCallback(() => {
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Normalize longitude to -180 to 180 range
    const wrapLng = (lng: number) => ((((lng % 360) + 540) % 360) - 180);

    const west = wrapLng(sw.lng);
    const east = wrapLng(ne.lng);

    // Keep raw center longitude for marker positioning across world copies
    const rawCenterLng = map.getCenter().lng;

    const bbox = bboxFromBounds({
      south: sw.lat,
      west,
      north: ne.lat,
      east
    });

    onBboxChange({
      ...bbox,
      viewCenterLng: rawCenterLng
    });
  }, [map, onBboxChange]);

  useEffect(() => {
    emitBbox();
  }, [emitBbox]);

  return null;
}
