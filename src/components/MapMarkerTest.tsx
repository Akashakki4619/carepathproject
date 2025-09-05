import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OptimizedMap from './OptimizedMap';
import { useRealTimeAmbulances, useRealTimeHospitals } from '@/hooks/useRealTimeData';

const MapMarkerTest: React.FC = () => {
  const { ambulances, loading: ambulancesLoading } = useRealTimeAmbulances();
  const { hospitals, loading: hospitalsLoading } = useRealTimeHospitals();
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);

  const selectedAmbulanceData = ambulances.find(amb => amb.id === selectedAmbulance);
  const selectedHospitalData = hospitals.find(hosp => hosp.id === selectedHospital);

  if (ambulancesLoading || hospitalsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading map data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Map Marker Test</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test component to verify that markers persist and update correctly without disappearing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ambulance Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Ambulance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ambulances.map(ambulance => (
              <div 
                key={ambulance.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAmbulance === ambulance.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedAmbulance(ambulance.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ambulance.vehicle_number}</p>
                    <p className="text-sm text-muted-foreground">{ambulance.driver_name}</p>
                  </div>
                  <Badge variant={
                    ambulance.status === 'available' ? 'default' :
                    ambulance.status === 'en_route' ? 'secondary' : 'destructive'
                  }>
                    {ambulance.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {ambulance.last_updated.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hospital Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Hospital</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hospitals.map(hospital => (
              <div 
                key={hospital.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedHospital === hospital.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedHospital(hospital.id)}
              >
                <div>
                  <p className="font-medium">{hospital.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Capacity: {hospital.current_load}/{hospital.capacity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Availability: {hospital.availability.toFixed(1)}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {hospital.last_updated.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <OptimizedMap
                ambulanceLocation={selectedAmbulanceData ? [selectedAmbulanceData.location.lng, selectedAmbulanceData.location.lat] : undefined}
                hospitalLocation={selectedHospitalData ? [selectedHospitalData.location.lng, selectedHospitalData.location.lat] : undefined}
                className="h-full w-full rounded-lg border"
              />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <strong>Selected Ambulance:</strong> {selectedAmbulanceData?.vehicle_number || 'None'}
              </p>
              <p className="text-sm">
                <strong>Selected Hospital:</strong> {selectedHospitalData?.name || 'None'}
              </p>
              <p className="text-xs text-muted-foreground">
                Markers should persist and update smoothly without disappearing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Ambulances ({ambulances.length})</h4>
              <div className="space-y-1 text-sm">
                {ambulances.map(ambulance => (
                  <div key={ambulance.id} className="flex justify-between">
                    <span>{ambulance.vehicle_number}</span>
                    <span className="text-muted-foreground">
                      {ambulance.last_updated.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Hospitals ({hospitals.length})</h4>
              <div className="space-y-1 text-sm">
                {hospitals.map(hospital => (
                  <div key={hospital.id} className="flex justify-between">
                    <span>{hospital.name}</span>
                    <span className="text-muted-foreground">
                      {hospital.last_updated.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapMarkerTest;
