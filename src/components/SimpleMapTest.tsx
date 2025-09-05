import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SimpleMap from './SimpleMap';

const SimpleMapTest: React.FC = () => {
  const [ambulanceLocation, setAmbulanceLocation] = useState<[number, number]>([-74.0060, 40.7128]);
  const [hospitalLocation] = useState<[number, number]>([-73.9851, 40.7589]);
  const [isMoving, setIsMoving] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const startMovement = () => {
    setIsMoving(true);
    setUpdateCount(0);
    
    const interval = setInterval(() => {
      setAmbulanceLocation(prev => {
        const newLng = prev[0] + (Math.random() - 0.5) * 0.001;
        const newLat = prev[1] + (Math.random() - 0.5) * 0.001;
        setUpdateCount(count => count + 1);
        return [newLng, newLat];
      });
    }, 3000);

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsMoving(false);
    }, 30000);
  };

  const stopMovement = () => {
    setIsMoving(false);
    setUpdateCount(0);
  };

  const resetPosition = () => {
    setAmbulanceLocation([-74.0060, 40.7128]);
    setUpdateCount(0);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Simple Map Test</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This is a simplified map component to test if markers persist correctly.
          The ambulance should move every 3 seconds without disappearing.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={startMovement} 
            disabled={isMoving}
            className="flex items-center gap-2"
          >
            Start Movement
          </Button>
          <Button 
            onClick={stopMovement} 
            variant="outline"
            className="flex items-center gap-2"
          >
            Stop Movement
          </Button>
          <Button 
            onClick={resetPosition} 
            variant="secondary"
            className="flex items-center gap-2"
          >
            Reset Position
          </Button>
        </div>

        <div className="flex gap-4 justify-center">
          {isMoving && (
            <Badge variant="destructive" className="flex items-center gap-2">
              Moving - Updates: {updateCount}
            </Badge>
          )}
          {!isMoving && (
            <Badge variant="default" className="flex items-center gap-2">
              Stopped - Updates: {updateCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <SimpleMap
                ambulanceLocation={ambulanceLocation}
                hospitalLocation={hospitalLocation}
                className="h-full w-full rounded-lg border"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Current Positions</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Ambulance:</strong> 
                  <br />
                  Lng: {ambulanceLocation[0].toFixed(6)}
                  <br />
                  Lat: {ambulanceLocation[1].toFixed(6)}
                </div>
                <div>
                  <strong>Hospital:</strong>
                  <br />
                  Lng: {hospitalLocation[0].toFixed(6)}
                  <br />
                  Lat: {hospitalLocation[1].toFixed(6)}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              <div className="space-y-2 text-sm">
                <div>Movement: {isMoving ? 'Active' : 'Stopped'}</div>
                <div>Updates: {updateCount}</div>
                <div>Last Update: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Expected Behavior:</strong> The red ambulance marker should move every 3 seconds 
                and the blue hospital marker should remain stationary. Neither marker should disappear.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleMapTest;
