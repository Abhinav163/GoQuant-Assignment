// data/region-polygons.ts
import { PolygonFeature, Provider } from '@/types';
import { createGeoCircle } from '@/utils/geo-helpers';
import { cloudRegions } from './cloud-regions';

const REGION_RADIUS_KM = 250; // Set a default "size" for our regions

export const regionPolygons: PolygonFeature[] = cloudRegions.map((region) => ({
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    // createGeoCircle returns [lng, lat][], GeoJSON polygon needs it nested one more time
    coordinates: [createGeoCircle([region.lng, region.lat], REGION_RADIUS_KM)],
  },
  properties: {
    id: region.id,
    name: region.name,
    provider: region.provider,
  },
}));