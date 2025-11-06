// app/page.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Import Data & Types
import { exchanges as allExchanges } from '@/data/exchange-locations';
import { cloudRegions as allCloudRegions } from '@/data/cloud-regions';
import { regionPolygons as allRegionPolygons } from '@/data/region-polygons'; 
import { LocationPoint, ArcData, Provider, HistoricalDataPoint, TimeRange, LatencyStats, PolygonFeature } from '@/types';

// Import UI Components
import ControlPanel from '@/components/ControlPanel';
import HistoricalChart from '@/components/HistoricalChart';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import Legend from '@/components/Legend';

// We will use the mock historical data again, as the new API is for real-time only
import { getMockHistoricalData, calculateStats } from '@/utils/latency-simulator';


const LatencyGlobe = dynamic(() => import('@/components/LatencyGlobe'), {
  ssr: false,
  loading: () => <p style={{ textAlign: 'center', marginTop: '20%' }}>Loading 3D Globe...</p>,
});

// Helper function to get latency color
const getLatencyColor = (latency: number): string => {
  if (latency < 50) return 'rgba(0, 255, 0, 0.7)'; // Green
  else if (latency < 150) return 'rgba(255, 255, 0, 0.7)'; // Yellow
  else return 'rgba(255, 0, 0, 0.7)'; // Red
};

// --- NEW HELPER FUNCTIONS ---

// Calculates distance between two lat/lng points in KM
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Finds the average latency of the nearest probes to a location
function getLatencyFromProbes(location: LocationPoint, probes: any[], probeCount = 3) {
  const sortedProbes = probes
    .filter(p => p.status === 'ready' && p.stats.rtt > 0)
    .map(probe => ({
      ...probe,
      distance: getDistance(location.lat, location.lng, probe.location.latitude, probe.location.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  const nearestProbes = sortedProbes.slice(0, probeCount);
  
  if (nearestProbes.length === 0) {
    return 100; // Fallback latency
  }

  const avgLatency = nearestProbes.reduce((acc, p) => acc + p.stats.rtt, 0) / nearestProbes.length;
  return avgLatency;
}

// --- END HELPER FUNCTIONS ---


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
  
  // --- NEW STATE for probes ---
  const [probes, setProbes] = useState<any[]>([]);

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

  // NEW: Fetch Globalping probes once on load
  useEffect(() => {
    fetch('https://api.globalping.io/v1/probes')
      .then(res => res.json())
      .then(data => {
        console.log(`Fetched ${data.length} probes`);
        setProbes(data);
      })
      .catch(err => console.error("Failed to fetch Globalping probes:", err));
  }, []);
  
  // MODIFIED: Real-time Latency Simulation
  useEffect(() => {
    // This effect now depends on 'probes'
    if (probes.length === 0) return; // Don't run until probes are loaded

    const updateLatency = () => {
      const newArcs: ArcData[] = [];
      for (const region of visibleRegions) {
        for (const exchange of visibleExchanges) {
          if (region.id === exchange.id) continue;

          // Get latency from nearest probes for each
          const regionLatency = getLatencyFromProbes(region, probes);
          const exchangeLatency = getLatencyFromProbes(exchange, probes);

          // Simple average of the two locations' general latencies
          const avgLatency = (regionLatency + exchangeLatency) / 2;
          const color = getLatencyColor(avgLatency);

          newArcs.push({
            startLat: region.lat,
            startLng: region.lng,
            endLat: exchange.lat,
            endLng: exchange.lng,
            color: color,
            label: `${region.name} to ${exchange.name}: ${avgLatency.toFixed(1)} ms (real-data)`,
          });
        }
      }
      setLatencyArcs(newArcs);
      setLastUpdateTime(new Date().toISOString());
    };

    updateLatency();
    // We can update this less frequently now
    const interval = setInterval(updateLatency, 60000); 
    return () => clearInterval(interval);
  }, [visibleRegions, visibleExchanges, probes]); // Re-run if probes change

  // Update Visible Points
  useEffect(() => {
    const regionPoints = showRegionBoundaries ? [] : visibleRegions;
    setPoints([...regionPoints, ...visibleExchanges]);
  }, [visibleRegions, visibleExchanges, showRegionBoundaries]);

  // MODIFIED: Historical Data Generation
  // Back to MOCK data for this, as the Globalping API is real-time only.
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
          polygonsData={visiblePolygons}
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
        showRegionBoundaries={showRegionBoundaries}
        setShowRegionBoundaries={setShowRegionBoundaries}
      />

      <HistoricalChart
        data={historicalData}
        stats={historicalStats}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      <PerformanceDashboard lastUpdateTime={lastUpdateTime} />

      <Legend />
      
    </main>
  );
}