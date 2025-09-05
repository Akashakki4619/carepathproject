import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Zap, Clock, AlertTriangle } from 'lucide-react';
import Map from './Map';
import OptimizedMap from './OptimizedMap';
import OptimizedRealTimeMap from './OptimizedRealTimeMap';

const MapComparisonDemo: React.FC = () => {
  const [ambulanceLocation, setAmbulanceLocation] = useState<[number, number]>([-74.0060, 40.7128]);
  const [hospitalLocation] = useState<[number, number]>([-73.9851, 40.7589]);
  const [isMoving, setIsMoving] = useState(false);

  const startMovement = () => {
    setIsMoving(true);
    const interval = setInterval(() => {
      setAmbulanceLocation(prev => [
        prev[0] + (Math.random() - 0.5) * 0.001,
        prev[1] + (Math.random() - 0.5) * 0.001
      ]);
    }, 1000);

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsMoving(false);
    }, 30000);
  };

  const stopMovement = () => {
    setIsMoving(false);
    window.location.reload(); // Simple way to stop all intervals
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Map Performance Comparison</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compare the performance difference between the original map implementation and the optimized version.
          The optimized version moves ambulance markers smoothly without re-rendering the entire map.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={startMovement} 
            disabled={isMoving}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Start Ambulance Movement
          </Button>
          <Button 
            onClick={stopMovement} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Stop & Reset
          </Button>
        </div>

        {isMoving && (
          <Badge variant="destructive" className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Ambulance is moving - Watch the performance difference!
          </Badge>
        )}
      </div>

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Side by Side</TabsTrigger>
          <TabsTrigger value="optimized">Optimized Only</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time Map</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Original Map (Re-renders every 3s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <Map
                    ambulanceLocation={ambulanceLocation}
                    hospitalLocation={hospitalLocation}
                    className="h-full w-full rounded-lg border"
                  />
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Performance Issue:</strong> This map re-renders completely every time the ambulance moves, 
                    causing flickering and poor performance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Optimized Map (Smooth Movement)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <OptimizedMap
                    ambulanceLocation={ambulanceLocation}
                    hospitalLocation={hospitalLocation}
                    className="h-full w-full rounded-lg border"
                  />
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Optimized:</strong> This map only moves the ambulance marker smoothly without 
                    re-rendering the entire map, providing better performance and user experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimized" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Optimized Map Component
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full">
                <OptimizedMap
                  ambulanceLocation={ambulanceLocation}
                  hospitalLocation={hospitalLocation}
                  className="h-full w-full rounded-lg border"
                />
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Key Optimizations:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Marker reference tracking to avoid recreation</li>
                  <li>• Smooth animation using requestAnimationFrame</li>
                  <li>• Memoized icons to prevent unnecessary re-renders</li>
                  <li>• Separate effects for different marker types</li>
                  <li>• Easing functions for natural movement</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Real-Time Map with Multiple Ambulances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OptimizedRealTimeMap />
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Real-Time Features:</strong> This map shows multiple ambulances moving simultaneously 
                  with smooth animations, traffic conditions, and hospital status updates - all without 
                  re-rendering the entire map.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Performance Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-red-600">Before (Original)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Map re-renders completely every 3 seconds</li>
                <li>• All markers and layers are recreated</li>
                <li>• Flickering and poor user experience</li>
                <li>• High CPU usage and memory consumption</li>
                <li>• Poor performance with multiple ambulances</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-600">After (Optimized)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Only marker positions are updated</li>
                <li>• Smooth animations with easing functions</li>
                <li>• No flickering or visual interruptions</li>
                <li>• Low CPU usage and efficient memory</li>
                <li>• Excellent performance with multiple ambulances</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapComparisonDemo;
