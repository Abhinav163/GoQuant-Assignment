import { LocationPoint } from "@/types";

export const cloudRegions: LocationPoint[] = [
  {
    id: 'aws-us-east-1',
    name: 'AWS (N. Virginia)',
    provider: 'aws',
    lat: 38.9072,
    lng: -77.0369,
  },
  {
    id: 'aws-eu-west-2',
    name: 'AWS (London)',
    provider: 'aws',
    lat: 51.5074,
    lng: -0.1278,
  },
  {
    id: 'aws-ap-northeast-1',
    name: 'AWS (Tokyo)',
    provider: 'aws',
    lat: 35.6895,
    lng: 139.6917,
  },
  {
    id: 'gcp-us-central1',
    name: 'GCP (Iowa)',
    provider: 'gcp',
    lat: 41.8863,
    lng: -93.6231,
  },
  {
    id: 'gcp-europe-west1',
    name: 'GCP (Belgium)',
    provider: 'gcp',
    lat: 50.8503,
    lng: 4.3517,
  },
  {
    id: 'azure-westus2',
    name: 'Azure (Washington)',
    provider: 'azure',
    lat: 47.7511,
    lng: -120.7401,
  },
  {
    id: 'azure-eastasia',
    name: 'Azure (Hong Kong)',
    provider: 'azure',
    lat: 22.3193,
    lng: 114.1694,
  },
];