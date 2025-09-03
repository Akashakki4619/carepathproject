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
import Map from '@/components/Map';
import StatusStrip from '@/components/StatusStrip';
import { User, Hospital as HospitalType, Trip, TrafficCondition, RouteOptimization } from '@/types';
import { findOptimalRoute, simulateVANETCommunication } from '@/utils/routing';
import { useToast } from '@/hooks/use-toast';
import { qosManager, Priority } from '@/services/QosManager';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
}

const mockHospitals: HospitalType[] = [
  { 
    id: 'h1', 
    name: 'City General Hospital', 
    address: '123 Main St', 
    coordinates: [-74.0060, 40.7128], 
    contact_number: '555-0101',
    capacity: 100,
    current_load: 65
  },
  { 
    id: 'h2', 
    name: 'Metro Emergency Center', 
    address: '456 Oak Ave', 
    coordinates: [-74.0160, 40.7228], 
    contact_number: '555-0102',
    capacity: 80,
    current_load: 40
  },
  { 
    id: 'h3', 
    name: 'University Medical Center', 
    address: '789 Pine St', 
    coordinates: [-73.9960, 40.7028], 
    contact_number: '555-0103',
    capacity: 120,
    current_load: 90
  }
];

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout }) => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([-74.0060, 40.7128]);
  const [route, setRoute] = useState<RouteOptimization | null>(null);
  const [vanetMessages, setVanetMessages] = useState<any[]>([]);
  const [trafficConditions, setTrafficConditions] = useState<TrafficCondition[]>([]);
  const [mode, setMode] = useState<'idle' | 'active' | 'emergency'>('idle');
  const { toast } = useToast();

  // Simulate real-time location updates with slower interval
  useEffect(() => {
    const interval = setInterval(async () => {
      setCurrentLocation(prev => [
        prev[0] + (Math.random() - 0.5) * 0.0003, // Smaller movements
        prev[1] + (Math.random() - 0.5) * 0.0003
      ]);

      // Simulate VANET communication
      const messages = simulateVANETCommunication(currentLocation);
      setVanetMessages(messages);

      // Update traffic conditions based on VANET data
      const newTrafficConditions: TrafficCondition[] = messages.map((msg, index) => ({
        road_segment: `segment_${index}`,
        coordinates: [msg.location, [msg.location[0] + 0.001, msg.location[1] + 0.001]],
        traffic_level: msg.trafficInfo.traffic_level,
        estimated_delay: msg.trafficInfo.estimated_delay,
        last_updated: new Date()
      }));
      setTrafficConditions(newTrafficConditions);

      // Send traffic updates via QoS with MEDIUM priority
      if (newTrafficConditions.length > 0) {
        await qosManager.sendPacket(
          user.id,
          'traffic_update',
          'MEDIUM',
          {
            ambulance_id: user.ambulance_id,
            location: currentLocation,
            traffic_conditions: newTrafficConditions,
            timestamp: new Date().toISOString()
          },
          'traffic_system'
        );
      }
    }, 20000); // Update every 20 seconds instead of 5

    return () => clearInterval(interval);
  }, [currentLocation, user.id, user.ambulance_id]);

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
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
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
                    <p className="font-medium">{route?.distance.toFixed(1)} km</p>
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
                {vanetMessages.map((msg, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <div className={`status-indicator ${
                      msg.trafficInfo.traffic_level === 'heavy' ? 'traffic-heavy' :
                      msg.trafficInfo.traffic_level === 'moderate' ? 'traffic-moderate' : 'traffic-light'
                    }`} />
                    <div className="flex-1 text-xs">
                      <p>Vehicle {msg.vehicleId}: {msg.trafficInfo.traffic_level} traffic</p>
                      <p className="text-muted-foreground">
                        Delay: {msg.trafficInfo.estimated_delay}min
                      </p>
                    </div>
                  </div>
                ))}
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
              <Map 
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