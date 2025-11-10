'use client';
import React from 'react';
import { FaAws, FaGoogle, FaMicrosoft, FaServer } from 'react-icons/fa';
import { Provider } from '@/types';

const providerDetails: Record<Provider, { name: string; icon: React.ReactElement; color: string }> = {
  aws: { name: 'AWS', icon: <FaAws />, color: '#FF9900' },
  gcp: { name: 'GCP', icon: <FaGoogle />, color: '#4285F4' },
  azure: { name: 'Azure', icon: <FaMicrosoft />, color: '#0078D4' },
  colo: { name: 'Co-Location', icon: <FaServer />, color: '#FF00FF' },
};

const Legend = () => {
  return (
    <div className="legend-panel panel">
      <h4>Legend</h4>
      <div className="legend-items">
        {Object.entries(providerDetails).map(([key, { name, icon, color }]) => (
          <div key={key} className="legend-item">
            <span className="legend-icon" style={{ color: color }}>
              {icon}
            </span>
            <span className="legend-label">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;