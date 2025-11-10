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
  ringsData: LocationPoint[];
}

const getProviderColor = (provider: Provider, opacity: number = 1): string => {
  switch (provider) {
    case 'aws': return `rgba(255, 153, 0, ${opacity})`; 
    case 'gcp': return `rgba(66, 133, 244, ${opacity})`;
    case 'azure': return `rgba(0, 120, 212, ${opacity})`;
    case 'colo': return `rgba(255, 0, 255, ${opacity})`; 
    default: return `rgba(255, 255, 255, ${opacity})`;
  }
};

const LatencyGlobe: React.FC<GlobeProps> = ({ 
  pointsData, 
  latencyArcs, 
  polygonsData, 
  heatmapData,
  ringsData
}) => {
  const { theme } = useTheme();

  const globeImageUrl = theme === 'dark'
    ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
    : "//unpkg.com/three-globe/example/img/earth-day.jpg";

  return (
    <Globe
      globeImageUrl={globeImageUrl}
      backgroundColor="rgba(0,0,0,0)"
      
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

      polygonsData={polygonsData}
      polygonGeoJsonGeometry="geometry"
      polygonCapColor={(feat) => getProviderColor((feat as PolygonFeature).properties.provider, 0.2)}
      polygonSideColor={() => 'rgba(0, 0, 0, 0)'} 
      polygonStrokeColor={(feat) => getProviderColor((feat as PolygonFeature).properties.provider, 0.7)}
      polygonLabel={({ properties }: any) => `
        <div class="globe-label">
          <b>${properties.name}</b>
        </div>
      `}

      heatmapsData={[heatmapData]}
      heatmapPointLat="lat"
      heatmapPointLng="lng"
      heatmapPointVal="val"
      heatmapRadius={20}
      ringsData={ringsData}
      ringLat="lat"
      ringLng="lng"
      ringMaxRadius={() => Math.random() * 10 + 3}
      ringPropagationSpeed={() => Math.random() * 1 + 1}
      ringRepeatPeriod={() => Math.random() * 1500 + 800} 
      ringColor={(point: LocationPoint) => (t: number) => getProviderColor(point.provider, 0.6)}
      ringAltitude={0.01} 
    />
  );
};

export default LatencyGlobe;