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
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
            <p>Select a Region and Exchange to view historical data.</p>
          </div>
        ) : (
          <>
            <div className="chart-controls">
              <div className="time-range-selector">
                {(['1h', '24h', '7d'] as TimeRange[]).map((range) => (
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
            </div>

            <ResponsiveContainer width="100%" height="calc(100% - 40px)">
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