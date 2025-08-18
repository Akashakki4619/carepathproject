import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteOptimization } from '@/types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for ambulance and hospital
const ambulanceIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="32" height="32">
      <path d="M18 8h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1.5a2.5 2.5 0 0 1-5 0h-3a2.5 2.5 0 0 1-5 0H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1zM8 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM8 8h8v2H8V8zm2-3v1h4V5h-4z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
      <path d="M3 21V3h18v18H3zm9-13h-2v3H7v2h3v3h2v-3h3v-2h-3V8z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapProps {
  route?: RouteOptimization;
  ambulanceLocation?: [number, number];
  hospitalLocation?: [number, number];
  className?: string;
}

// Helper components to avoid context issues
const AmbulanceMarker: React.FC<{ position: [number, number] }> = ({ position }) => (
  <Marker position={position} icon={ambulanceIcon}>
    <Popup>
      <div className="text-center">
        <strong>Ambulance</strong>
        <br />
        Current Location
      </div>
    </Popup>
  </Marker>
);

const HospitalMarker: React.FC<{ position: [number, number] }> = ({ position }) => (
  <Marker position={position} icon={hospitalIcon}>
    <Popup>
      <div className="text-center">
        <strong>Hospital</strong>
        <br />
        Destination
      </div>
    </Popup>
  </Marker>
);

const RoutePolyline: React.FC<{ positions: [number, number][] }> = ({ positions }) => (
  <Polyline
    positions={positions}
    color="#dc2626"
    weight={5}
    opacity={0.8}
  />
);

const Map: React.FC<MapProps> = ({ 
  route, 
  ambulanceLocation, 
  hospitalLocation, 
  className = "w-full h-96" 
}) => {
  // Default center coordinates (New York City)
  const defaultCenter: [number, number] = [40.7128, -74.0060];
  
  // Use ambulance location as center if available, otherwise use default
  const mapCenter = ambulanceLocation ? [ambulanceLocation[1], ambulanceLocation[0]] as [number, number] : defaultCenter;
  
  // Convert route coordinates from [lng, lat] to [lat, lng] for Leaflet
  const routePositions = route?.route.map(coord => [coord[1], coord[0]] as [number, number]) || [];

  // Prepare children array to avoid conditional rendering issues
  const mapChildren = [
    <TileLayer
      key="tile-layer"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  ];

  if (ambulanceLocation) {
    mapChildren.push(
      <AmbulanceMarker 
        key="ambulance-marker"
        position={[ambulanceLocation[1], ambulanceLocation[0]]} 
      />
    );
  }

  if (hospitalLocation) {
    mapChildren.push(
      <HospitalMarker 
        key="hospital-marker"
        position={[hospitalLocation[1], hospitalLocation[0]]} 
      />
    );
  }

  if (routePositions.length > 0) {
    mapChildren.push(
      <RoutePolyline 
        key="route-polyline"
        positions={routePositions}
      />
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        {mapChildren}
      </MapContainer>
    </div>
  );
};

export default Map;