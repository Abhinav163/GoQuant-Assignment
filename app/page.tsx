'use client';
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

import { exchanges as allExchanges } from '@/data/exchange-locations';
import { cloudRegions as allCloudRegions } from '@/data/cloud-regions';
import { regionPolygons as allRegionPolygons } from '@/data/region-polygons'; 
import { LocationPoint, ArcData, Provider, HistoricalDataPoint, TimeRange, LatencyStats, PolygonFeature } from '@/types';

import ControlPanel from '@/components/ControlPanel';
import HistoricalChart from '@/components/HistoricalChart';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import Legend from '@/components/Legend';

import { getMockHistoricalData, calculateStats } from '@/utils/latency-simulator';


const LatencyGlobe = dynamic(() => import('@/components/LatencyGlobe'), {
  ssr: false,
  loading: () => <p style={{ textAlign: 'center', marginTop: '20%' }}>Loading 3D Globe...</p>,
});

const getLatencyColor = (latency: number): string => {
  if (latency < 50) return 'rgba(0, 255, 0, 0.7)'; // Green
  else if (latency < 150) return 'rgba(255, 255, 0, 0.7)'; // Yellow
  else return 'rgba(255, 0, 0, 0.7)'; // Red
};

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
    return 100;
  }

  const avgLatency = nearestProbes.reduce((acc, p) => acc + p.stats.rtt, 0) / nearestProbes.length;
  return avgLatency;
}


export default function Home() {
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

  const [showRegionBoundaries, setShowRegionBoundaries] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [probes, setProbes] = useState<any[]>([]);
  const [showTopology, setShowTopology] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

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

  const visibleHeatmapData = useMemo(() => {
    if (!showHeatmap || probes.length === 0) {
      return [];
    }
    return probes
      .filter(p => p.status === 'ready' && p.stats.rtt > 0)
      .map(p => ({
        lat: p.location.latitude,
        lng: p.location.longitude,
        val: p.stats.rtt / 100,
      }));
  }, [probes, showHeatmap]);

  const topologyArcs = useMemo(() => {
    if (!showTopology) return [];
    
    const arcs: ArcData[] = [];
    const exchangeColor = 'rgba(136, 132, 216, 0.4)';

    for (let i = 0; i < visibleExchanges.length; i++) {
      for (let j = i + 1; j < visibleExchanges.length; j++) {
        const ex1 = visibleExchanges[i];
        const ex2 = visibleExchanges[j];
        arcs.push({
          startLat: ex1.lat,
          startLng: ex1.lng,
          endLat: ex2.lat,
          endLng: ex2.lng,
          color: exchangeColor,
          label: `${ex1.name} <-> ${ex2.name} (Topology)`,
        });
      }
    }
    return arcs;
  }, [showTopology, visibleExchanges]);

  const allVisibleArcs = useMemo(() => {
    return [...latencyArcs, ...topologyArcs];
  }, [latencyArcs, topologyArcs]);

  const visibleRings = useMemo(() => {
    if (!showVolume) return [];
    return visibleExchanges; 
  }, [showVolume, visibleExchanges]);
  
  useEffect(() => {
    fetch('https://api.globalping.io/v1/probes')
      .then(res => res.json())
      .then(data => {
        console.log(`Fetched ${data.length} probes`);
        setProbes(data);
      })
      .catch(err => console.error("Failed to fetch Globalping probes:", err));
  }, []);
  
  useEffect(() => {
    if (probes.length === 0) return; 

    const updateLatency = () => {
      const newArcs: ArcData[] = [];
      for (const region of visibleRegions) {
        for (const exchange of visibleExchanges) {
          if (region.id === exchange.id) continue;
          
          const regionLatency = getLatencyFromProbes(region, probes);
          const exchangeLatency = getLatencyFromProbes(exchange, probes);
          
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
    const interval = setInterval(updateLatency, 60000); 
    return () => clearInterval(interval);
  }, [visibleRegions, visibleExchanges, probes]);

  useEffect(() => {
    const regionPoints = showRegionBoundaries ? [] : visibleRegions;
    setPoints([...regionPoints, ...visibleExchanges]);
  }, [visibleRegions, visibleExchanges, showRegionBoundaries]);

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
          latencyArcs={allVisibleArcs}
          polygonsData={visiblePolygons}
          heatmapData={visibleHeatmapData}
          ringsData={visibleRings} 
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
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        showTopology={showTopology}
        setShowTopology={setShowTopology}
        showVolume={showVolume}
        setShowVolume={setShowVolume}
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