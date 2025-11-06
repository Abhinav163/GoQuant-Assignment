// app/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Import Data & Types
import { exchanges as allExchanges } from '@/data/exchange-locations';
import { cloudRegions as allCloudRegions } from '@/data/cloud-regions';
import { regionPolygons as allRegionPolygons } from '@/data/region-polygons'; // Import new data
import { LocationPoint, ArcData, Provider, HistoricalDataPoint, TimeRange, LatencyStats, PolygonFeature } from '@/types'; // Import PolygonFeature

// Import Simulator
import { getMockLatency, getMockHistoricalData, calculateStats } from '@/utils/latency-simulator';

// Import UI Components
import ControlPanel from '@/components/ControlPanel';
import HistoricalChart from '@/components/HistoricalChart';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import Legend from '@/components/Legend'; // Import new component

const LatencyGlobe = dynamic(() => import('@/components/LatencyGlobe'), {
  ssr: false,
  loading: () => <p style={{ textAlign: 'center', marginTop: '20%' }}>Loading 3D Globe...</p>,
});

export default function Home() {
  // --- State ---
  const [latencyArcs, setLatencyArcs] = useState<ArcData[]>([]);
  const [points, setPoints] = useState<LocationPoint[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [historicalStats, setHistoricalStats] = useState<LatencyStats>({ min: 0, max: 0, avg: 0 });
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Record<Provider, boolean>>({
    aws: true, gcp: true, azure: true, colo: true,
  });
  
  const [selectedPair, setSelectedPair] = useState<{ from: string | null; to: string | null }>({
    from: null, to: null,
  });

  // --- New State ---
  const [showRegionBoundaries, setShowRegionBoundaries] = useState(true);

  // --- Memos for Filtering ---
  const visibleRegions = useMemo(() => {
    return allCloudRegions.filter(r => 
      filters[r.provider] && r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filters, searchTerm]);

  const visibleExchanges = useMemo(() => {
    return allExchanges.filter(e => 
      filters[e.provider] && e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filters, searchTerm]);

  // --- New Memo for Polygons ---
  const visiblePolygons = useMemo(() => {
    if (!showRegionBoundaries) {
      return [];
    }
    return allRegionPolygons.filter(p =>
      filters[p.properties.provider] &&
      p.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filters, searchTerm, showRegionBoundaries]);

  // --- useEffects ---
  
  // Real-time Latency Simulation
  useEffect(() => {
    const updateLatency = () => {
      const newArcs: ArcData[] = [];
      for (const region of visibleRegions) {
        for (const exchange of visibleExchanges) {
          if (region.id === exchange.id) continue;
          const { latency, color } = getMockLatency(region.id, exchange.id);
          newArcs.push({
            startLat: region.lat,
            startLng: region.lng,
            endLat: exchange.lat,
            endLng: exchange.lng,
            color: color,
            label: `${region.name} to ${exchange.name}: ${latency} ms`,
          });
        }
      }
      setLatencyArcs(newArcs);
      setLastUpdateTime(new Date().toISOString());
    };

    updateLatency();
    const interval = setInterval(updateLatency, 5000);
    return () => clearInterval(interval);
  }, [visibleRegions, visibleExchanges]);

  // Update Visible Points
  useEffect(() => {
    // If showing boundaries, don't show the center point for regions
    const regionPoints = showRegionBoundaries ? [] : visibleRegions;
    setPoints([...regionPoints, ...visibleExchanges]);
  }, [visibleRegions, visibleExchanges, showRegionBoundaries]);

  // Historical Data Generation
  useEffect(() => {
    if (selectedPair.from && selectedPair.to) {
      const data = getMockHistoricalData(selectedPair.from, selectedPair.to, timeRange);
      const stats = calculateStats(data);
      setHistoricalData(data);
      setHistoricalStats(stats);
    } else {
      setHistoricalData([]);
      setHistoricalStats({ min: 0, max: 0, avg: 0 });
    }
  }, [selectedPair, timeRange]);

  return (
    <main>
      <div style={{ position: 'absolute', zIndex: 0, width: '100%', height: '100%' }}>
        <LatencyGlobe
          pointsData={points}
          latencyArcs={latencyArcs}
          polygonsData={visiblePolygons} // <-- Pass new prop
        />
      </div>

      <ControlPanel
        exchanges={allExchanges}
        cloudRegions={allCloudRegions}
        filters={filters}
        setFilters={setFilters}
        selectedPair={selectedPair}
        setSelectedPair={setSelectedPair}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showRegionBoundaries={showRegionBoundaries} // <-- Pass new prop
        setShowRegionBoundaries={setShowRegionBoundaries} // <-- Pass new prop
      />

      <HistoricalChart
        data={historicalData}
        stats={historicalStats}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <PerformanceDashboard lastUpdateTime={lastUpdateTime} />

      <Legend /> {/* <-- Add the new Legend component */}
      
    </main>
  );
}