export const createGeoCircle = (
  center: [number, number],
  radiusInKm: number,
  points: number = 32
): [number, number][] => {
  const [lng, lat] = center;
  const earthRadiusKm = 6371;
  const coords: [number, number][] = [];
  const distance = radiusInKm / earthRadiusKm;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  for (let i = 0; i < points; i++) {
    const bearing = (i * 2 * Math.PI) / points;
    
    const newLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(distance) +
      Math.cos(latRad) * Math.sin(distance) * Math.cos(bearing)
    );
    
    const newLngRad = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(distance) * Math.cos(latRad),
      Math.cos(distance) - Math.sin(latRad) * Math.sin(newLatRad)
    );

    coords.push([
      (newLngRad * 180) / Math.PI,
      (newLatRad * 180) / Math.PI 
    ]);
  }
  
  coords.push(coords[0]);
  
  return coords;
};