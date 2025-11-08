// components/HistoricalChart.tsx
'use client';
import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { HistoricalDataPoint, LatencyStats, TimeRange } from '@/types';
import { FaChevronDown, FaChevronUp, FaFileCsv } from 'react-icons/fa';

interface ChartProps {
  data: HistoricalDataPoint[];
  stats: LatencyStats;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const time = new Date(label).toLocaleString();
    return (
      <div className="custom-tooltip">
        <p className="label">{`${time}`}</p>
        <p>{`Latency: ${payload[0].value.toFixed(1)} ms`}</p>
      </div>
    );
  }
  return null;
};

const HistoricalChart: React.FC<ChartProps> = ({
  data,
  stats,
  timeRange,
  onTimeRangeChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const yMin = Math.floor(stats.min * 0.9);
  const yMax = Math.ceil(stats.max * 1.1);

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = "time,latency\n";
    const rows = data.map(d => `${d.time},${d.latency}`).join("\n");
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `latency-data-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="panel chart-container">
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>Historical Latency</h3>
        <button className="panel-toggle-btn">
          {isCollapsed ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      <div className={`panel-content ${isCollapsed ? 'collapsed' : ''}`}>
        {!data || data.length === 0 ? (
          <div className="chart-container-empty">
            <p>Select a Region and Exchange to view historical data. (No data available for this selection.)</p>
          </div>
        ) : (
          <>
            <div className="chart-controls">
              <div className="time-range-selector">
                {(['1h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    className={timeRange === range ? 'active' : ''}
                    onClick={() => onTimeRangeChange(range)}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="stats-display">
                Min: <span>{stats.min}</span>
                Max: <span>{stats.max}</span>
                Avg: <span>{stats.avg}</span>
              </div>
              <button className="export-btn" onClick={handleExportCSV} title="Export as CSV">
                <FaFileCsv />
              </button>
            </div>

            {/* --- THIS IS THE FIX --- */}
            {/* The container is 300px, header is 45px, controls are ~40px. Let's give it a fixed height. */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis
                  dataKey="time"
                  stroke="#999"
                  tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()}
                  fontSize={10}
                />
                <YAxis
                  stroke="#999"
                  fontSize={10}
                  domain={[yMin, yMax]}
                  label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#999' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoricalChart;