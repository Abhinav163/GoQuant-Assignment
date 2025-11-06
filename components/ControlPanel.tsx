// components/ControlPanel.tsx
'use client';
import React, { useState } from 'react';
import { FaAws, FaGoogle, FaMicrosoft, FaServer, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { LocationPoint, Provider } from '@/types';
import ThemeToggle from './ThemeToggle';

interface ControlProps {
  exchanges: LocationPoint[];
  cloudRegions: LocationPoint[];
  filters: Record<Provider, boolean>;
  setFilters: (filters: Record<Provider, boolean>) => void;
  selectedPair: { from: string | null; to: string | null };
  setSelectedPair: (pair: { from: string | null; to: string | null }) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showRegionBoundaries: boolean; // <-- New Prop
  setShowRegionBoundaries: (show: boolean) => void; // <-- New Prop
}

const providerIcons: Record<Provider, React.ReactElement> = {
  aws: <FaAws color="#FF9900" />,
  gcp: <FaGoogle color="#4285F4" />,
  azure: <FaMicrosoft color="#0078D4" />,
  colo: <FaServer color="#FF00FF" />,
};

const ControlPanel: React.FC<ControlProps> = ({
  exchanges,
  cloudRegions,
  filters,
  setFilters,
  selectedPair,
  setSelectedPair,
  searchTerm,
  setSearchTerm,
  showRegionBoundaries, // <-- Destructure new prop
  setShowRegionBoundaries, // <-- Destructure new prop
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleFilterChange = (provider: Provider) => {
    setFilters({ ...filters, [provider]: !filters[provider] });
  };

  return (
    <div className="panel control-panel">
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>Controls & Filters</h3>
        <button className="panel-toggle-btn">
          {isCollapsed ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      <div className={`panel-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="search-box-container" style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', top: '10px', left: '10px', color: '#999' }}/>
          <input
            type="text"
            placeholder="Search exchanges or regions..."
            className="search-box"
            style={{ paddingLeft: '35px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <h3>Layer Filters</h3>
        <div className="filters">
          {(Object.keys(filters) as Provider[]).map((provider) => (
            <label key={provider} className="filter-label">
              <input
                type="checkbox"
                checked={filters[provider]}
                onChange={() => handleFilterChange(provider)}
              />
              <span className="icon">{providerIcons[provider]}</span>
              {provider.toUpperCase()}
            </label>
          ))}
        </div>

        {/* --- NEW SECTION --- */}
        <div className="toggle-group">
          <label htmlFor="region-toggle">Show Region Boundaries</label>
          <label className="toggle-switch">
            <input
              id="region-toggle"
              type="checkbox"
              checked={showRegionBoundaries}
              onChange={(e) => setShowRegionBoundaries(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        {/* ----------------- */}

        <hr />

        <h3>Historical Latency</h3>
        <div className="select-group">
          <label>From Region:</label>
          <select
            value={selectedPair.from || ''}
            onChange={(e) => setSelectedPair({ ...selectedPair, from: e.target.value })}
            disabled={searchTerm !== ''}
          >
            <option value="">Select Region...</option>
            {cloudRegions.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        
        <div className="select-group">
          <label>To Exchange:</label>
          <select
            value={selectedPair.to || ''}
            onChange={(e) => setSelectedPair({ ...selectedPair, to: e.target.value })}
            disabled={searchTerm !== ''}
          >
            <option value="">Select Exchange...</option>
            {exchanges.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <hr />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default ControlPanel;