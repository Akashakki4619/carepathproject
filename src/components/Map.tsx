import React, { useEffect, useRef, useState } from 'react';
import { RouteOptimization, TrafficCondition } from '@/types';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

// Dynamic imports to avoid SSR issues
let L: any = null;

interface MapProps {
  route?: RouteOptimization;
  ambulanceLocation?: [number, number];
  hospitalLocation?: [number, number];
  trafficConditions?: TrafficCondition[];
  className?: string;
}

const Map: React.FC<MapProps> = ({ 
  route, 
  ambulanceLocation, 
  hospitalLocation, 
  trafficConditions = [],
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

  const recenterMap = () => {
    if (!map.current || !L) return;
    
    const bounds = L.latLngBounds([]);
    let hasMarkers = false;

    if (ambulanceLocation) {
      bounds.extend([ambulanceLocation[1], ambulanceLocation[0]]);
      hasMarkers = true;
    }
    
    if (hospitalLocation) {
      bounds.extend([hospitalLocation[1], hospitalLocation[0]]);
      hasMarkers = true;
    }

    if (route?.route && route.route.length > 0) {
      route.route.forEach(coord => bounds.extend([coord[1], coord[0]]));
      hasMarkers = true;
    }

    if (hasMarkers) {
      map.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  // Add markers and routes - memoize to prevent unnecessary updates
  useEffect(() => {
    if (!map.current || !L || !isLoaded) return;

    // Clear existing layers except tile layer
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

    // Add traffic conditions polylines
    trafficConditions.forEach((traffic, index) => {
      if (traffic.coordinates && traffic.coordinates.length >= 2) {
        const coords = traffic.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
        const weight = traffic.traffic_level === 'heavy' ? 8 : traffic.traffic_level === 'moderate' ? 5 : 3;
        const color = traffic.traffic_level === 'heavy' ? '#ef4444' : traffic.traffic_level === 'moderate' ? '#f59e0b' : '#22c55e';
        
        L.polyline(coords, {
          color,
          weight,
          opacity: 0.7,
          dashArray: traffic.traffic_level === 'heavy' ? '10, 5' : undefined
        }).addTo(map.current)
          .bindPopup(`<b>Traffic: ${traffic.traffic_level}</b><br>Delay: ${traffic.estimated_delay}min`);
      }
    });

    // Auto fit bounds after adding markers and routes
    setTimeout(recenterMap, 100);

  }, [ambulanceLocation, hospitalLocation, route, trafficConditions, isLoaded]);

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

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className={`${className} leaflet-container`}
        style={{ 
          borderRadius: '8px',
          minHeight: '300px',
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 0
        }} 
      />
      {isLoaded && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-[1000] bg-background/90 backdrop-blur-sm h-10 w-10"
          onClick={recenterMap}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Map;