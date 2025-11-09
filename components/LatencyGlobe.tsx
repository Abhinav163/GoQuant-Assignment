// components/LatencyGlobe.tsx
'use client'; 

import React from 'react';
import Globe from 'react-globe.gl'; 
import { LocationPoint, ArcData, Provider, PolygonFeature } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface GlobeProps {
  pointsData: LocationPoint[];
  latencyArcs: ArcData[];
  polygonsData: PolygonFeature[];
  heatmapData: { lat: number, lng: number, val: number }[];
  ringsData: LocationPoint[]; // <-- ADD THIS PROP
}

// Helper function for colors, now with opacity
const getProviderColor = (provider: Provider, opacity: number = 1): string => {
  switch (provider) {
    case 'aws': return `rgba(255, 153, 0, ${opacity})`; // #FF9900
    case 'gcp': return `rgba(66, 133, 244, ${opacity})`; // #4285F4
    case 'azure': return `rgba(0, 120, 212, ${opacity})`; // #0078D4
    case 'colo': return `rgba(255, 0, 255, ${opacity})`; // #FF00FF
    default: return `rgba(255, 255, 255, ${opacity})`;
  }
};

const LatencyGlobe: React.FC<GlobeProps> = ({ 
  pointsData, 
  latencyArcs, 
  polygonsData, 
  heatmapData,
  ringsData // <-- DESTRUCTURE THIS PROP
}) => {
  const { theme } = useTheme();

  const globeImageUrl = theme === 'dark'
    ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
    : "//unpkg.com/three-globe/example/img/earth-day.jpg";

  return (
    <Globe
      globeImageUrl={globeImageUrl}
      backgroundColor="rgba(0,0,0,0)"
      
      // --- Points ---
      pointsData={pointsData}
      pointLat="lat"
      pointLng="lng"
      pointColor={(point) => getProviderColor((point as LocationPoint).provider)}
      pointRadius={0.25}
      pointLabel={(point) => `
        <div class="globe-label">
          <b>${(point as LocationPoint).name}</b><br/>
          <span>${(point as LocationPoint).location || (point as LocationPoint).provider.toUpperCase()}</span>
        </div>
      `}
      
      // --- Arcs ---
      arcsData={latencyArcs}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor="color"
      arcStroke={0.2}
      arcDashLength={0.7}
      arcDashGap={1}
      arcDashAnimateTime={3000}

      // --- Polygons ---
      polygonsData={polygonsData}
      polygonGeoJsonGeometry="geometry"
      polygonCapColor={(feat) => getProviderColor((feat as PolygonFeature).properties.provider, 0.2)}
      polygonSideColor={() => 'rgba(0, 0, 0, 0)'} // No sides
      polygonStrokeColor={(feat) => getProviderColor((feat as PolygonFeature).properties.provider, 0.7)}
      polygonLabel={({ properties }: any) => `
        <div class="globe-label">
          <b>${properties.name}</b>
        </div>
      `}
      
      // --- Heatmap ---
      heatmapsData={[heatmapData]}
      heatmapPointLat="lat"
      heatmapPointLng="lng"
      heatmapPointWeight="val"
      heatmapPointRadius={20}

      // --- ADD RINGS (VOLUME) ---
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringMaxRadius={() => Math.random() * 10 + 3} // Simulate volume size
      ringPropagationSpeed={() => Math.random() * 1 + 1} // Simulate speed
      ringRepeatPeriod={() => Math.random() * 1500 + 800} // Simulate frequency
      // --- THIS IS THE FIX ---
      // We remove the (t: number) => ... wrapper. The prop just wants the color for the ring.
      ringColor={(point) => getProviderColor((point as LocationPoint).provider, 0.6)}
      ringAltitude={0.01} // Slightly above surface
    />
  );
};

export default LatencyGlobe;
