import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRealTimeAmbulances, useRealTimeHospitals, useRealTimeTraffic } from '@/hooks/useRealTimeData';
import { Ambulance, MapPin, AlertTriangle, Clock, Users } from 'lucide-react';

const RealTimeMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const { ambulances } = useRealTimeAmbulances();
  const { hospitals } = useRealTimeHospitals();
  const { trafficUpdates } = useRealTimeTraffic();

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      // Dynamic import to avoid build errors
      const mapboxgl = await import('mapbox-gl');
      await import('mapbox-gl/dist/mapbox-gl.css');
      
      mapboxgl.default.accessToken = mapboxToken;
      
      const map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.0060, 40.7128], // NYC
        zoom: 12,
      });

      map.addControl(new mapboxgl.default.NavigationControl());

      // Add ambulance markers
      ambulances.forEach(ambulance => {
        const el = document.createElement('div');
        el.className = 'ambulance-marker';
        el.innerHTML = `
          <div style="
            background: ${ambulance.status === 'available' ? '#22c55e' : 
                      ambulance.status === 'en_route' ? '#f59e0b' : 
                      ambulance.status === 'transporting' ? '#ef4444' : '#6b7280'};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">🚑</div>
        `;

        const popup = new mapboxgl.default.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${ambulance.vehicle_number}</h3>
              <p style="margin: 0; font-size: 12px;">Driver: ${ambulance.driver_name}</p>
              <p style="margin: 0; font-size: 12px;">Status: ${ambulance.status.replace('_', ' ')}</p>
              <p style="margin: 0; font-size: 10px; color: #666;">Updated: ${ambulance.last_updated.toLocaleTimeString()}</p>
            </div>
          `);

        new mapboxgl.default.Marker(el)
          .setLngLat([ambulance.location.lng, ambulance.location.lat])
          .setPopup(popup)
          .addTo(map);
      });

      // Add hospital markers
      hospitals.forEach(hospital => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            background: ${hospital.availability > 20 ? '#22c55e' : hospital.availability > 10 ? '#f59e0b' : '#ef4444'};
            width: 30px;
            height: 30px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">🏥</div>
        `;

        const popup = new mapboxgl.default.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${hospital.name}</h3>
              <p style="margin: 0; font-size: 12px;">Capacity: ${hospital.current_load}/${hospital.capacity}</p>
              <p style="margin: 0; font-size: 12px;">Availability: ${hospital.availability.toFixed(1)}%</p>
              <p style="margin: 0; font-size: 12px;">Incoming: ${hospital.incoming_ambulances}</p>
            </div>
          `);

        new mapboxgl.default.Marker(el)
          .setLngLat([hospital.location.lng, hospital.location.lat])
          .setPopup(popup)
          .addTo(map);
      });

      // Add traffic markers
      trafficUpdates.forEach(traffic => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            background: ${traffic.traffic_level === 'low' ? '#22c55e' : 
                       traffic.traffic_level === 'moderate' ? '#f59e0b' : 
                       traffic.traffic_level === 'high' ? '#f97316' : '#ef4444'};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            border: 1px solid white;
            box-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">⚠️</div>
        `;

        const popup = new mapboxgl.default.Popup({ offset: 15 })
          .setHTML(`
            <div style="padding: 6px;">
              <h4 style="margin: 0 0 2px 0; font-size: 12px; font-weight: bold;">${traffic.road_segment}</h4>
              <p style="margin: 0; font-size: 10px;">Level: ${traffic.traffic_level}</p>
              <p style="margin: 0; font-size: 10px;">Delay: ${traffic.delay_minutes} min</p>
            </div>
          `);

        new mapboxgl.default.Marker(el)
          .setLngLat([traffic.location.lng, traffic.location.lat])
          .setPopup(popup)
          .addTo(map);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'en_route': return 'secondary';
      case 'transporting': return 'destructive';
      default: return 'outline';
    }
  };

  if (showTokenInput) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Real-Time Map Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Please enter your Mapbox public token to enable the real-time map. 
              You can get one from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTokenSubmit()}
              />
              <Button onClick={handleTokenSubmit}>
                Initialize Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Tracking Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={mapContainer} className="w-full h-96 rounded-lg border" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Ambulance className="w-4 h-4" />
              Active Ambulances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ambulances.map(ambulance => (
              <div key={ambulance.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">{ambulance.vehicle_number}</p>
                  <p className="text-xs text-muted-foreground">{ambulance.driver_name}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(ambulance.status)}>
                  {ambulance.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Hospital Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hospitals.map(hospital => (
              <div key={hospital.id} className="p-2 border rounded">
                <p className="text-sm font-medium">{hospital.name}</p>
                <div className="flex justify-between text-xs">
                  <span>Capacity: {hospital.current_load}/{hospital.capacity}</span>
                  <span className={`${hospital.availability > 20 ? 'text-green-600' : 
                                   hospital.availability > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {hospital.availability.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Traffic Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trafficUpdates.map(traffic => (
              <div key={traffic.id} className="p-2 border rounded">
                <p className="text-sm font-medium">{traffic.road_segment}</p>
                <div className="flex justify-between text-xs">
                  <Badge variant={traffic.traffic_level === 'low' ? 'default' : 
                                  traffic.traffic_level === 'moderate' ? 'secondary' : 'destructive'}>
                    {traffic.traffic_level}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {traffic.delay_minutes}m
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeMap;