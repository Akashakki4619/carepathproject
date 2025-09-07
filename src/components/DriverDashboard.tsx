import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Radio,
  Hospital,
  Route,
  Timer,
  Car,
  Phone,
  RotateCcw
} from 'lucide-react';
import SimpleMap from '@/components/SimpleMap';
import StatusStrip from '@/components/StatusStrip';
import { User, Hospital as HospitalType, Trip, TrafficCondition, RouteOptimization } from '@/types';
import { findOptimalRoute, simulateVANETCommunication } from '@/utils/routing';
import { useToast } from '@/hooks/use-toast';
import { qosManager, Priority } from '@/services/QosManager';
import { useVanetCommunication } from '@/hooks/useVanetCommunication';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
}

const mockHospitals: HospitalType[] = [
  { 
    id: 'h1', 
    name: 'NewYork-Presbyterian Hospital', 
    address: '525 E 68th St, New York, NY', 
    coordinates: [-73.9564, 40.7648], // Upper East Side - definitely on land
    contact_number: '212-746-5454',
    capacity: 100,
    current_load: 65
  },
  { 
    id: 'h2', 
    name: 'Mount Sinai Hospital', 
    address: '1468 Madison Ave, New York, NY', 
    coordinates: [-73.9514, 40.7903], // Upper East Side - on land
    contact_number: '212-241-6500',
    capacity: 80,
    current_load: 40
  },
  { 
    id: 'h3', 
    name: 'NYU Langone Health', 
    address: '550 1st Ave, New York, NY', 
    coordinates: [-73.9738, 40.7392], // Midtown East - on land
    contact_number: '212-263-7300',
    capacity: 120,
    current_load: 90
  }
];

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout }) => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-73.9876, 40.7489]); // Times Square area - on land
  const [route, setRoute] = useState<RouteOptimization | null>(null);
  const [trafficConditions, setTrafficConditions] = useState<TrafficCondition[]>([]);
  const [mode, setMode] = useState<'idle' | 'active' | 'emergency'>('idle');
  const [tripProgress, setTripProgress] = useState<number>(0);
  const [remainingDistance, setRemainingDistance] = useState<number>(0);
  const { toast } = useToast();
  const { messages: vanetMessages, networkStatus } = useVanetCommunication(currentLocation);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Simulate real-time location updates and route following
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentTrip && route && route.route.length > 0) {
        // Move ambulance along the route
        const startTime = currentTrip.start_time.getTime();
        const currentTime = Date.now();
        const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
        const totalTime = route.estimated_time;
        const progress = Math.min(elapsedMinutes / totalTime, 1);
        
        if (progress < 1) {
          // Calculate position along route
          const routeLength = route.route.length;
          const targetIndex = Math.floor(progress * (routeLength - 1));
          const nextIndex = Math.min(targetIndex + 1, routeLength - 1);
          
          if (targetIndex < routeLength) {
            const currentWaypoint = route.route[targetIndex];
            const nextWaypoint = route.route[nextIndex];
            
            // Interpolate between waypoints for smooth movement
            const segmentProgress = (progress * (routeLength - 1)) - targetIndex;
            const lat = currentWaypoint[1] + (nextWaypoint[1] - currentWaypoint[1]) * segmentProgress;
            const lng = currentWaypoint[0] + (nextWaypoint[0] - currentWaypoint[0]) * segmentProgress;
            
            setCurrentLocation([lng, lat]);
            
            // Update trip progress
            setTripProgress(progress * 100);
            
            // Calculate remaining distance to hospital
            const hospital = mockHospitals.find(h => h.id === currentTrip.hospital_id);
            if (hospital) {
              const distanceToHospital = calculateDistance(lat, lng, hospital.coordinates[1], hospital.coordinates[0]);
              setRemainingDistance(distanceToHospital);
              
              // Auto-end trip when ambulance reaches hospital (within 50 meters)
              if (distanceToHospital < 0.05) {
                setTimeout(() => {
                  setCurrentTrip(null);
                  setRoute(null);
                  setMode('idle');
                  setTripProgress(0);
                  setRemainingDistance(0);
                  toast({
                    title: "Trip Completed",
                    description: "Patient successfully delivered to hospital. Trip ended automatically.",
                  });
                }, 1000);
              }
            }
          }
        } else {
          // Trip time exceeded, auto-complete
          setTripProgress(100);
          setTimeout(() => {
            setCurrentTrip(null);
            setRoute(null);
            setMode('idle');
            setTripProgress(0);
            setRemainingDistance(0);
            toast({
              title: "Trip Completed",
              description: "Patient successfully delivered to hospital.",
            });
          }, 1000);
        }
      } else {
        // Random movement when no active trip
        setCurrentLocation(prev => [
          prev[0] + (Math.random() - 0.5) * 0.0002,
          prev[1] + (Math.random() - 0.5) * 0.0002
        ]);
      }
    }, 2000); // Update every 2 seconds for faster movement

    return () => clearInterval(interval);
  }, [currentTrip, route, toast, calculateDistance]);

  const startTrip = async () => {
    if (!selectedHospital) {
      toast({
        title: "Error",
        description: "Please select a destination hospital",
        variant: "destructive"
      });
      return;
    }

    const hospital = mockHospitals.find(h => h.id === selectedHospital)!;
    const optimizedRoute = findOptimalRoute(currentLocation, hospital.coordinates, trafficConditions);

    const newTrip: Trip = {
      id: Math.random().toString(),
      ambulance_id: user.ambulance_id!,
      hospital_id: selectedHospital,
      start_location: currentLocation,
      destination_location: hospital.coordinates,
      route: optimizedRoute.route,
      status: 'started',
      start_time: new Date(),
      estimated_arrival: new Date(Date.now() + optimizedRoute.estimated_time * 60000),
      traffic_conditions: trafficConditions
    };

    // Send trip start event via QoS with HIGH priority
    await qosManager.sendPacket(
      user.id,
      'trip_start',
      'HIGH',
      {
        trip_id: newTrip.id,
        ambulance_id: user.ambulance_id,
        hospital_id: selectedHospital,
        hospital_name: hospital.name,
        estimated_arrival: newTrip.estimated_arrival,
        route_optimization: optimizedRoute
      },
      selectedHospital
    );

    setCurrentTrip(newTrip);
    setRoute(optimizedRoute);
    setMode('active');

    toast({
      title: "Trip Started",
      description: `Route to ${hospital.name} calculated. ETA: ${Math.round(optimizedRoute.estimated_time)} minutes.`,
    });

    // Simulate hospital notification
    setTimeout(() => {
      toast({
        title: "Hospital Notified",
        description: `${hospital.name} has been alerted of your arrival.`,
      });
    }, 2000);
  };

  const endTrip = () => {
    if (currentTrip) {
      setCurrentTrip(null);
      setRoute(null);
      setMode('idle');
      toast({
        title: "Trip Completed",
        description: "Patient successfully delivered to hospital.",
      });
    }
  };

  const callHospital = () => {
    // Stub function for calling hospital
    toast({
      title: "Calling Hospital",
      description: "Contacting destination hospital...",
    });
  };

  const getTrafficColor = (level: 'light' | 'moderate' | 'heavy') => {
    switch (level) {
      case 'light': return 'success';
      case 'moderate': return 'warning';
      case 'heavy': return 'destructive';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emergency rounded-lg">
              <Car className="w-6 h-6 text-emergency-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Driver Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="pulse-emergency">
              <Radio className="w-3 h-3 mr-1" />
              VANET Active
            </Badge>
            <Button variant="outline" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Trip Controls */}
        <div className="space-y-6">
          {/* Trip Initiation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="w-5 h-5" />
                Start New Trip
              </CardTitle>
              <CardDescription>
                Select destination hospital to begin emergency transport
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Destination Hospital</label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockHospitals.map(hospital => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{hospital.name}</span>
                          <Badge 
                            variant={hospital.current_load > 80 ? "destructive" : "secondary"}
                            className="ml-2"
                          >
                            {hospital.current_load}% capacity
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!currentTrip ? (
                <Button 
                  variant="emergency" 
                  className="w-full" 
                  onClick={startTrip}
                  disabled={!selectedHospital}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Start Emergency Route
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  className="w-full" 
                  onClick={endTrip}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Trip
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Current Trip Status */}
          {currentTrip && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Active Trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(tripProgress)}%</span>
                  </div>
                  <Progress value={tripProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ETA</span>
                    <p className="font-medium">
                      {currentTrip.estimated_arrival.toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Distance</span>
                    <p className="font-medium">
                      {remainingDistance > 0 ? remainingDistance.toFixed(1) : route?.distance.toFixed(1)} km
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-sm text-muted-foreground">Hospital</span>
                  <p className="font-medium">
                    {mockHospitals.find(h => h.id === currentTrip.hospital_id)?.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* VANET Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                VANET Messages
              </CardTitle>
              <CardDescription>
                Real-time vehicle-to-vehicle communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {vanetMessages.length > 0 ? vanetMessages.map((msg, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      msg.priority === 'critical' ? 'bg-destructive' :
                      msg.priority === 'high' ? 'bg-orange-500' :
                      msg.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 text-xs">
                      <p className="font-medium">{msg.content}</p>
                      <p className="text-muted-foreground">
                        {msg.messageType} - {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-sm">No VANET messages</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Map */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Strip */}
          {currentTrip && (
            <StatusStrip
              route={route}
              eta={currentTrip.estimated_arrival}
              distance={route?.distance || null}
              nextTurn="Turn right in 200m"
              trafficConditions={trafficConditions}
            />
          )}
          
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5" />
                Live Route Map
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <SimpleMap 
                route={route || undefined}
                ambulanceLocation={currentLocation}
                hospitalLocation={
                  selectedHospital ? 
                  mockHospitals.find(h => h.id === selectedHospital)?.coordinates : 
                  undefined
                }
                trafficConditions={trafficConditions}
                className="h-full w-full rounded-b-lg"
              />
            </CardContent>
          </Card>

          {/* Sticky Action Bar */}
          {currentTrip && (
            <div className="sticky bottom-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="lg" className="h-12 px-6">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Next Turn
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-6" onClick={callHospital}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call Hospital
                </Button>
                <Button variant="destructive" size="lg" className="h-12 px-6" onClick={endTrip}>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  End Trip
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;