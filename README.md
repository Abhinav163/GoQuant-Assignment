# Crypto Infrastructure Latency Map

This is a Next.js application that renders an interactive 3D globe to visualize real-time and historical latency between major cryptocurrency exchanges and global cloud provider co-location regions.

The dashboard provides a high-level overview of network performance, helping to identify optimal locations for trading infrastructure.

## 🚀 Features

- **Interactive 3D Globe**: Built with `react-globe.gl`, allowing for smooth panning, zooming, and rotation.
- **Real-time Latency Arcs**: Visualizes latency between cloud regions and exchanges. Connections are color-coded (Green, Yellow, Red) for easy identification of network quality.
- **Historical Latency Chart**: Uses `recharts` to display a time-series chart for a selected Region-to-Exchange pair. Includes stats for Min, Max, and Avg latency.
- **Data Export**: Historical data can be exported to a `.csv` file directly from the chart component.
- **Dynamic Filtering & Search**: A comprehensive control panel allows users to:
  - Filter by cloud provider (AWS, GCP, Azure, Colo).
  - Search for specific regions or exchanges.
  - Toggle the visibility of cloud region boundaries and the latency heatmap.
- **Legend & Tooltips**: A clear legend and interactive hover tooltips provide context for data points on the globe.
- **Performance Dashboard**: Displays real-time Frames Per Second (FPS) and the last data update time.
- **Dark/Light Theme**: A theme toggle is included, using React Context and CSS variables for a seamless user experience.
- **Responsive Design**: The layout adapts to smaller screens by adjusting panel visibility and layout.

### Bonus Features Implemented

- **Latency Heatmap**: An overlay on the globe visualizes global latency hotspots based on live probe data.
- **Dark/Light Theme Toggle**: Fully implemented.
- **Export Functionality**: Implemented for historical data.

## 🛠 Tech Stack & Key Libraries

- **Framework**: Next.js
- **Language**: TypeScript
- **3D Visualization**: `react-globe.gl`
- **Charting**: `recharts`
- **State Management**: React Hooks (`useState`, `useEffect`, `useMemo`, `useContext`)
- **Styling**: TailwindCSS & Global CSS with variables for theming
- **Icons**: `react-icons`

## 📊 Data Sources

- **Real-time Latency**: Data is fetched from the **Globalping API** (`https://api.globalping.io/v1/probes`). The application calculates an average latency for each location based on the nearest available probes.
- **Historical Latency**: This data is **simulated** for demonstration purposes. The `utils/latency-simulator.ts` file generates realistic, time-series data with jitter for any selected region-exchange pair.
- **Static Data**:
  - **Exchange Locations**: Defined in `data/exchange-locations.ts`.
- **Cloud Regions**: Defined in `data/cloud-regions.ts`.
- **Region Polygons**: Defined in `data/region-polygons.ts`.

## 💡 Assumptions & Design Choices

- **Real-time Data**: The `globalping.io` API provides a network of probes. Since direct pinging from a cloud region to an exchange isn't feasible in a simple demo, I've _assumed_ that the average latency from the 3 nearest probes to a given point is a reasonable proxy for its network health.
- **Historical Data**: As no historical API was specified, I created a mock data generator (`utils/latency-simulator.ts`) to populate the historical chart and demonstrate its full functionality, including time-range selection and CSV export.
- **Performance**:
  - The `LatencyGlobe` component is loaded dynamically with `ssr: false` to prevent server-side rendering errors and improve initial page load.
  - `useMemo` hooks are used to memoize filtered lists of points, arcs, and polygons, preventing re-calculation on every render.
- **Styling**: A combination of global CSS (`app/globals.css`) for base layout/theme and utility classes (via Tailwind) was chosen for rapid development and easy maintenance.

## 🏁 Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```
