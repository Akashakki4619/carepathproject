import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Ambulance, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Users,
  Bed,
  Activity,
  Navigation,
  Phone
} from 'lucide-react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface HospitalDashboardProps {
  user: User;
  onLogout: () => void;
}

interface IncomingAmbulance {
  id: string;
  driverName: string;
  ambulanceNumber: string;
  currentLocation: [number, number];
  eta: Date;
  distance: number;
  trafficStatus: 'light' | 'moderate' | 'heavy';
  patientInfo?: string;
  status: 'approaching' | 'delayed' | 'arrived';
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout }) => {
  const [incomingAmbulances, setIncomingAmbulances] = useState<IncomingAmbulance[]>([]);
  const [hospitalStats, setHospitalStats] = useState({
    totalBeds: 120,
    occupiedBeds: 85,
    emergencyBeds: 20,
    availableEmergencyBeds: 12,
    staffOnDuty: 45,
    currentLoad: 71
  });
  const { toast } = useToast();

  // Simulate incoming ambulances
  useEffect(() => {
    const mockAmbulances: IncomingAmbulance[] = [
      {
        id: '1',
        driverName: 'John Driver',
        ambulanceNumber: 'EMT-001',
        currentLocation: [-74.0060, 40.7128],
        eta: new Date(Date.now() + 8 * 60000),
        distance: 2.3,
        trafficStatus: 'moderate',
        patientInfo: 'Cardiac emergency, stable condition',
        status: 'approaching'
      },
      {
        id: '2',
        driverName: 'Sarah Wilson',
        ambulanceNumber: 'EMT-015',
        currentLocation: [-74.0160, 40.7228],
        eta: new Date(Date.now() + 15 * 60000),
        distance: 4.1,
        trafficStatus: 'light',
        patientInfo: 'Motor vehicle accident, multiple injuries',
        status: 'approaching'
      }
    ];

    setIncomingAmbulances(mockAmbulances);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setIncomingAmbulances(prev => 
        prev.map(ambulance => ({
          ...ambulance,
          eta: new Date(ambulance.eta.getTime() - 60000), // Decrease ETA by 1 minute
          distance: Math.max(0.1, ambulance.distance - 0.2) // Decrease distance
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Show notifications for new ambulances
  useEffect(() => {
    if (incomingAmbulances.length > 0) {
      incomingAmbulances.forEach(ambulance => {
        if (ambulance.eta.getTime() - Date.now() < 10 * 60000) { // Less than 10 minutes
          toast({
            title: "Incoming Ambulance",
            description: `${ambulance.ambulanceNumber} arriving in ${Math.ceil((ambulance.eta.getTime() - Date.now()) / 60000)} minutes`,
            duration: 5000,
          });
        }
      });
    }
  }, []);

  const getTrafficBadgeVariant = (status: 'light' | 'moderate' | 'heavy') => {
    switch (status) {
      case 'light': return 'default';
      case 'moderate': return 'secondary';
      case 'heavy': return 'destructive';
    }
  };

  const getStatusBadgeVariant = (status: 'approaching' | 'delayed' | 'arrived') => {
    switch (status) {
      case 'approaching': return 'default';
      case 'delayed': return 'destructive';
      case 'arrived': return 'secondary';
    }
  };

  const formatTimeRemaining = (eta: Date) => {
    const minutes = Math.ceil((eta.getTime() - Date.now()) / 60000);
    return minutes > 0 ? `${minutes} min` : 'Arriving now';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-medical rounded-lg">
              <Heart className="w-6 h-6 text-medical-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Hospital Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="pulse-emergency">
              <Activity className="w-3 h-3 mr-1" />
              {incomingAmbulances.length} Incoming
            </Badge>
            <Button variant="outline" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Hospital Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-medical-light rounded-lg">
                  <Bed className="w-5 h-5 text-medical" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Beds</p>
                  <p className="text-xl font-bold">
                    {hospitalStats.totalBeds - hospitalStats.occupiedBeds}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emergency-light rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-emergency" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emergency Beds</p>
                  <p className="text-xl font-bold">{hospitalStats.availableEmergencyBeds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-light rounded-lg">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Staff on Duty</p>
                  <p className="text-xl font-bold">{hospitalStats.staffOnDuty}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-light rounded-lg">
                  <Activity className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="text-xl font-bold">{hospitalStats.currentLoad}%</p>
                </div>
              </div>
              <Progress value={hospitalStats.currentLoad} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Incoming Ambulances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ambulance className="w-5 h-5" />
              Incoming Ambulances
            </CardTitle>
            <CardDescription>
              Real-time tracking of emergency vehicles en route
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomingAmbulances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ambulance className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No incoming ambulances at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingAmbulances.map(ambulance => (
                  <div key={ambulance.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emergency-light rounded-lg">
                          <Ambulance className="w-5 h-5 text-emergency" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{ambulance.ambulanceNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            Driver: {ambulance.driverName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(ambulance.status)}>
                          {ambulance.status}
                        </Badge>
                        <Badge variant={getTrafficBadgeVariant(ambulance.trafficStatus)}>
                          {ambulance.trafficStatus} traffic
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>ETA: {formatTimeRemaining(ambulance.eta)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Distance: {ambulance.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-muted-foreground" />
                        <span>Route optimized</span>
                      </div>
                    </div>

                    {ambulance.patientInfo && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium text-sm mb-1">Patient Information:</h4>
                          <p className="text-sm text-muted-foreground">{ambulance.patientInfo}</p>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2">
                      <Button variant="medical" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Driver
                      </Button>
                      <Button variant="outline" size="sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        Track Location
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preparation Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Preparation</CardTitle>
              <CardDescription>
                Ensure readiness for incoming patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-success-light rounded">
                <span className="text-sm">Emergency team alerted</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-success-light rounded">
                <span className="text-sm">Trauma bay prepared</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-warning-light rounded">
                <span className="text-sm">Blood bank notified</span>
                <Badge variant="secondary">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-success-light rounded">
                <span className="text-sm">Radiology on standby</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>
                Current hospital resource status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Emergency Beds</span>
                  <span>{hospitalStats.availableEmergencyBeds}/{hospitalStats.emergencyBeds}</span>
                </div>
                <Progress value={(hospitalStats.availableEmergencyBeds / hospitalStats.emergencyBeds) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Operating Rooms</span>
                  <span>3/5 Available</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Medical Staff</span>
                  <span>{hospitalStats.staffOnDuty}/50 On Duty</span>
                </div>
                <Progress value={(hospitalStats.staffOnDuty / 50) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;