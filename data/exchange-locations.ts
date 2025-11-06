// data/exchange-locations.ts
import { LocationPoint } from "@/types";

export const exchanges: LocationPoint[] = [
  {
    id: "deribit",
    name: "Deribit",
    provider: "colo",
    location: "Equinix LD4, London, UK",
    lat: 51.5074,
    lng: -0.1278,
    // countryCode: 'GB', // <-- Add this
  },
  {
    id: "binance",
    name: "Binance (APAC)",
    provider: "aws",
    location: "AWS ap-northeast-1, Tokyo",
    lat: 35.6895,
    lng: 139.6917,
    // countryCode: 'JP', // <-- Add this
  },
  {
    id: "bybit",
    name: "Bybit",
    provider: "aws",
    location: "AWS ap-southeast-1, Singapore",
    lat: 1.3521,
    lng: 103.8198,
    // countryCode: 'SG', // <-- Add this
  },
  {
    id: "okx",
    name: "OKX",
    provider: "gcp",
    location: "GCP asia-east2, Hong Kong",
    lat: 22.3193,
    lng: 114.1694,
    // countryCode: 'HK', // <-- Add this
  },
  {
    id: "coinbase",
    name: "Coinbase",
    provider: "aws",
    location: "AWS us-east-1, N. Virginia",
    lat: 38.9072,
    lng: -77.0369,
    // countryCode: 'US', // <-- Add this
  },
];