import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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

interface MarkerRefs {
  ambulance?: any;
  hospital?: any;
  route?: any;
  traffic: any[];
}

const OptimizedMap: React.FC<MapProps> = ({ 
  route, 
  ambulanceLocation, 
  hospitalLocation, 
  trafficConditions = [],
  className = "w-full h-96" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markerRefs = useRef<MarkerRefs>({ traffic: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leaflet = await import('leaflet');
        L = leaflet.default;
        
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
      const defaultCenter: [number, number] = [17.3850, 78.4867]; // Hyderabad, India
      const mapCenter = ambulanceLocation ? [ambulanceLocation[1], ambulanceLocation[0]] : defaultCenter;

      map.current = L.map(mapContainer.current).setView(mapCenter, 12);

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

  // Create custom icons (memoized to prevent recreation)
  const icons = useMemo(() => {
    if (!L) return null;
    
    return {
      ambulance: L.divIcon({
        html: `<div style="background: #dc2626; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; transition: transform 0.3s ease;">🚑</div>`,
        iconSize: [24, 24],
        className: 'custom-marker'
      }),
      hospital: L.divIcon({
        html: `<div style="background: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">🏥</div>`,
        iconSize: [24, 24],
        className: 'custom-marker'
      })
    };
  }, [L]);

  // Smooth marker movement function
  const moveMarkerSmoothly = useCallback((marker: any, newLatLng: [number, number], duration: number = 1000) => {
    if (!marker || !map.current) return;

    const startLatLng = marker.getLatLng();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);

      const currentLat = startLatLng.lat + (newLatLng[1] - startLatLng.lat) * easedProgress;
      const currentLng = startLatLng.lng + (newLatLng[0] - startLatLng.lng) * easedProgress;

      marker.setLatLng([currentLat, currentLng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Update ambulance marker position smoothly
  useEffect(() => {
    if (!map.current || !L || !isLoaded || !ambulanceLocation || !icons) return;

    const [lng, lat] = ambulanceLocation;

    if (markerRefs.current.ambulance) {
      // Move existing marker smoothly
      moveMarkerSmoothly(markerRefs.current.ambulance, [lng, lat], 2000);
    } else {
      // Create new marker
      const marker = L.marker([lat, lng], { icon: icons.ambulance })
        .addTo(map.current)
        .bindPopup('<b>Ambulance</b><br>Current Location');
      
      markerRefs.current.ambulance = marker;
    }
  }, [ambulanceLocation, isLoaded, icons, moveMarkerSmoothly]);

  // Update hospital marker (static, no need for smooth movement)
  useEffect(() => {
    if (!map.current || !L || !isLoaded || !hospitalLocation || !icons) return;

    // Remove existing hospital marker
    if (markerRefs.current.hospital) {
      map.current.removeLayer(markerRefs.current.hospital);
    }

    const [lng, lat] = hospitalLocation;
    const marker = L.marker([lat, lng], { icon: icons.hospital })
      .addTo(map.current)
      .bindPopup('<b>Hospital</b><br>Destination');
    
    markerRefs.current.hospital = marker;
  }, [hospitalLocation, isLoaded, icons]);

  // Update route (static, no need for smooth movement)
  useEffect(() => {
    if (!map.current || !L || !isLoaded || !route?.route || route.route.length === 0) return;

    // Remove existing route
    if (markerRefs.current.route) {
      map.current.removeLayer(markerRefs.current.route);
    }

    const routeCoords = route.route.map(coord => [coord[1], coord[0]] as [number, number]);
    const polyline = L.polyline(routeCoords, { 
      color: '#dc2626', 
      weight: 5, 
      opacity: 0.8 
    }).addTo(map.current);
    
    markerRefs.current.route = polyline;
  }, [route, isLoaded]);

  // Update traffic conditions (static, no need for smooth movement)
  useEffect(() => {
    if (!map.current || !L || !isLoaded) return;

    // Remove existing traffic markers
    markerRefs.current.traffic.forEach(marker => {
      map.current.removeLayer(marker);
    });
    markerRefs.current.traffic = [];

    // Add new traffic markers
    trafficConditions.forEach((traffic, index) => {
      if (traffic.coordinates && traffic.coordinates.length >= 2) {
        const coords = traffic.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
        const weight = traffic.traffic_level === 'heavy' ? 8 : traffic.traffic_level === 'moderate' ? 5 : 3;
        const color = traffic.traffic_level === 'heavy' ? '#ef4444' : traffic.traffic_level === 'moderate' ? '#f59e0b' : '#22c55e';
        
        const polyline = L.polyline(coords, {
          color,
          weight,
          opacity: 0.7,
          dashArray: traffic.traffic_level === 'heavy' ? '10, 5' : undefined
        }).addTo(map.current)
          .bindPopup(`<b>Traffic: ${traffic.traffic_level}</b><br>Delay: ${traffic.estimated_delay}min`);
        
        markerRefs.current.traffic.push(polyline);
      }
    });
  }, [trafficConditions, isLoaded]);

  const recenterMap = useCallback(() => {
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
  }, [ambulanceLocation, hospitalLocation, route]);

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

export default OptimizedMap;
