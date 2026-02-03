import { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import type { Bbox } from '../lib/types';
import { bboxFromBounds } from '../lib/bbox';

type ViewportObserverProps = {
  onBboxChange: (bbox: Bbox) => void;
};

export default function ViewportObserver({ onBboxChange }: ViewportObserverProps) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      onBboxChange(
        bboxFromBounds({
          south: sw.lat,
          west: sw.lng,
          north: ne.lat,
          east: ne.lng
        })
      );
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      onBboxChange(
        bboxFromBounds({
          south: sw.lat,
          west: sw.lng,
          north: ne.lat,
          east: ne.lng
        })
      );
    }
  });

  useEffect(() => {
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    onBboxChange(
      bboxFromBounds({
        south: sw.lat,
        west: sw.lng,
        north: ne.lat,
        east: ne.lng
      })
    );
  }, [map, onBboxChange]);

  return null;
}
