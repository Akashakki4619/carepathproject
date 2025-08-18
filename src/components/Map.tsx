import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RouteOptimization } from '@/types';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    if (!mapContainer.current) return;

    // For demonstration, we'll show a placeholder message
    // In production, you would use the Mapbox token from Supabase Edge Function Secrets
    if (!mapboxToken) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: ambulanceLocation || [-74.5, 40],
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, ambulanceLocation]);

  useEffect(() => {
    if (!map.current || !route) return;

    // Add route line
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.route
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#dc2626',
        'line-width': 5
      }
    });
  }, [route]);

  useEffect(() => {
    if (!map.current || !ambulanceLocation) return;

    // Add ambulance marker
    new mapboxgl.Marker({ color: '#dc2626' })
      .setLngLat(ambulanceLocation)
      .addTo(map.current);
  }, [ambulanceLocation]);

  useEffect(() => {
    if (!map.current || !hospitalLocation) return;

    // Add hospital marker
    new mapboxgl.Marker({ color: '#2563eb' })
      .setLngLat(hospitalLocation)
      .addTo(map.current);
  }, [hospitalLocation]);

  if (!mapboxToken) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">Map Integration</h3>
          <p className="text-muted-foreground mb-4">
            To display the interactive map, you need to add your Mapbox access token.
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Enter Mapbox Public Token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Get your token from{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
};

export default Map;