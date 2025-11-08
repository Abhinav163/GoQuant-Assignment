// utils/latency-simulator.ts
import { HistoricalDataPoint, LatencyStats, TimeRange } from "@/types";

const baseLatencyMap = new Map<string, number>();

const getBaseLatency = (fromId: string, toId: string): number => {
  const key = `${fromId}_${toId}`;
  if (!baseLatencyMap.has(key)) {
    const base = 5 + Math.random() * 295;
    baseLatencyMap.set(key, base);
  }
  return baseLatencyMap.get(key) as number;
};

export const getMockLatency = (fromId: string, toId: string) => {
  const baseLatency = getBaseLatency(fromId, toId);
  const jitter = (Math.random() - 0.5) * (baseLatency * 0.3);
  const latency = Math.max(5, baseLatency + jitter);

  let color: string;
  if (latency < 50) color = 'rgba(0, 255, 0, 0.7)'; // Green
  else if (latency < 150) color = 'rgba(255, 255, 0, 0.7)'; // Yellow
  else color = 'rgba(255, 0, 0, 0.7)'; // Red

  return { latency: parseFloat(latency.toFixed(1)), color };
};

export const getMockHistoricalData = (
  fromId: string,
  toId: string,
  range: TimeRange
): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();
  
  let totalMinutes: number;
  let stepMinutes: number;

  switch (range) {
    case '1h':
      totalMinutes = 60;
      stepMinutes = 1; // 60 points
      break;
    case '7d':
      totalMinutes = 7 * 24 * 60;
      stepMinutes = 60; // 168 points
      break;
    case '30d': // <-- NEW CASE
      totalMinutes = 30 * 24 * 60;
      stepMinutes = 240; // 4-hour intervals, 180 points
      break;
    case '24h':
    default:
      totalMinutes = 24 * 60;
      stepMinutes = 15; // 96 points
      break;
  }

  for (let i = totalMinutes; i > 0; i -= stepMinutes) {
    const timestamp = new Date(now.getTime() - i * 60000).toISOString();
    const { latency } = getMockLatency(fromId, toId);
    data.push({ time: timestamp, latency });
  }
  return data;
};

export const calculateStats = (data: HistoricalDataPoint[]): LatencyStats => {
  if (data.length === 0) return { min: 0, max: 0, avg: 0 };

  const latencies = data.map(d => d.latency);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = sum / latencies.length;

  return {
    min: parseFloat(min.toFixed(1)),
    max: parseFloat(max.toFixed(1)),
    avg: parseFloat(avg.toFixed(1)),
  };
};