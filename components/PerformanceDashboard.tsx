// components/PerformanceDashboard.tsx
'use client';
import React from 'react';
import { useFPS } from '@/hooks/useFPS';
import { FaTachometerAlt, FaSync } from 'react-icons/fa';

interface PerformanceDashboardProps {
  lastUpdateTime: string | null;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ lastUpdateTime }) => {
  const fps = useFPS();

  const getFPSColor = () => {
    if (fps >= 50) return '#00ff00'; // Green
    if (fps >= 30) return '#ffff00'; // Yellow
    return '#ff0000'; // Red
  };

  return (
    <div className="performance-dashboard panel">
      <div className="perf-item">
        <FaTachometerAlt style={{ color: getFPSColor() }} />
        <span style={{ color: getFPSColor() }}>{fps}</span>
        <span className="perf-label">FPS</span>
      </div>
      <div className="perf-item">
        <FaSync className="spin-icon" />
        <span className="perf-label">Last Update:</span>
        <span>{lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString() : '...'}</span>
      </div>
    </div>
  );
};

export default PerformanceDashboard;