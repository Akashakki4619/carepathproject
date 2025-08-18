import React, { useEffect, useRef, useState } from 'react';
import { RouteOptimization } from '@/types';

// Dynamic imports to avoid SSR issues
let L: any = null;

interface MapProps {
  route?: RouteOptimization;
  ambulanceLocation?: [number, number];
  hospitalLocation?: [number, number];
  className?: string;
}

const Map: React.FC<MapProps> = ({ 
  route, 
  ambulanceLocation, 
  hospitalLocation, 
  className = "w-full h-96" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Dynamically import Leaflet
        const leaflet = await import('leaflet');
        L = leaflet.default;
        
        // Import CSS
        await import('leaflet/dist/leaflet.css');
        
        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setLoadError('Failed to load map library');
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!isLoaded || !L || !mapContainer.current || map.current) return;

    try {
      // Default center coordinates (New York City)
      const defaultCenter: [number, number] = [40.7128, -74.0060];
      const mapCenter = ambulanceLocation ? [ambulanceLocation[1], ambulanceLocation[0]] : defaultCenter;

      // Initialize map
      map.current = L.map(mapContainer.current).setView(mapCenter, 12);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.current);

    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isLoaded, ambulanceLocation]);

  // Add markers and routes
  useEffect(() => {
    if (!map.current || !L || !isLoaded) return;

    // Clear existing layers
    map.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current.removeLayer(layer);
      }
    });

    // Create custom icons
    const ambulanceIcon = L.divIcon({
      html: `<div style="background: #dc2626; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">🚑</div>`,
      iconSize: [24, 24],
      className: 'custom-marker'
    });

    const hospitalIcon = L.divIcon({
      html: `<div style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">🏥</div>`,
      iconSize: [24, 24],
      className: 'custom-marker'
    });

    // Add ambulance marker
    if (ambulanceLocation) {
      L.marker([ambulanceLocation[1], ambulanceLocation[0]], { icon: ambulanceIcon })
        .addTo(map.current)
        .bindPopup('<b>Ambulance</b><br>Current Location');
    }

    // Add hospital marker
    if (hospitalLocation) {
      L.marker([hospitalLocation[1], hospitalLocation[0]], { icon: hospitalIcon })
        .addTo(map.current)
        .bindPopup('<b>Hospital</b><br>Destination');
    }

    // Add route
    if (route?.route && route.route.length > 0) {
      const routeCoords = route.route.map(coord => [coord[1], coord[0]] as [number, number]);
      L.polyline(routeCoords, { 
        color: '#dc2626', 
        weight: 5, 
        opacity: 0.8 
      }).addTo(map.current);
    }

  }, [ambulanceLocation, hospitalLocation, route, isLoaded]);

  if (loadError) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center border`}>
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">Map Error</h3>
          <p className="text-muted-foreground">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center border`}>
        <div className="text-center p-6">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} style={{ borderRadius: '8px' }} />;
};

export default Map;