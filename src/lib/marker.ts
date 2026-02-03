import L from 'leaflet';

export function createFlightIcon(heading: number | null) {
  const rotation = Number.isFinite(heading) ? Number(heading) : 0;

  return L.divIcon({
    className: 'flight-icon',
    html: `<div class="flight-marker" style="transform: rotate(${rotation}deg)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}
