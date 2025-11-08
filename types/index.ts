// types/index.ts

export type Provider = 'aws' | 'gcp' | 'azure' | 'colo';

export interface LocationPoint {
  id: string;
  name: string;
  provider: Provider;
  location?: string;
  lat: number;
  lng: number;
  // countryCode?: string;
}

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
}

export interface HistoricalDataPoint {
  time: string;
  latency: number;
}

export type TimeRange = '1h' | '24h' | '7d' | '30d';

export interface LatencyStats {
  min: number;
  max: number;
  avg: number;
}

export interface PolygonFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][]; // GeoJSON format for Polygon
  };
  properties: {
    id: string;
    name: string;
    provider: Provider;
  };
}