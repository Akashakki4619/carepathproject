import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Phone,
  Map as MapIcon,
  Thermometer,
  Gauge,
  Zap,
  Eye
} from 'lucide-react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Map from '@/components/Map';
import QosVisualization from '@/components/QosVisualization';

interface HospitalDashboardProps {
  user: User;
  onLogout: () => void;
}

interface VitalSigns {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  temperature: number;
  consciousness: 'alert' | 'drowsy' | 'unconscious';
  painLevel: number;
}

interface IncomingAmbulance {
  id: string;
  driverName: string;
  driverPhone: string;
  ambulanceNumber: string;
  currentLocation: [number, number];
  eta: Date;
  distance: number;
  trafficStatus: 'light' | 'moderate' | 'heavy';
  patientInfo?: string;
  status: 'approaching' | 'delayed' | 'arrived';
  vitalSigns: VitalSigns;
  emergencyType: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  allergies: string[];
  medications: string[];
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout }) => {
  const [incomingAmbulances, setIncomingAmbulances] = useState<IncomingAmbulance[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<IncomingAmbulance | null>(null);
  const [hospitalStats, setHospitalStats] = useState({
    totalBeds: 120,
    occupiedBeds: 85,
    emergencyBeds: 20,
    availableEmergencyBeds: 12,
    staffOnDuty: 45,
    currentLoad: 71
  });
  const { toast } = useToast();

  // Hospital location (example coordinates)
  const hospitalLocation: [number, number] = [-74.0050, 40.7120];

  // Simulate incoming ambulances
  useEffect(() => {
    const mockAmbulances: IncomingAmbulance[] = [
      {
        id: '1',
        driverName: 'John Driver',
        driverPhone: '+1 (555) 123-4567',
        ambulanceNumber: 'EMT-001',
        currentLocation: [-74.0060, 40.7128],
        eta: new Date(Date.now() + 8 * 60000),
        distance: 2.3,
        trafficStatus: 'moderate',
        patientInfo: 'Cardiac emergency, stable condition',
        status: 'approaching',
        emergencyType: 'Cardiac Emergency',
        severity: 'critical',
        allergies: ['Penicillin', 'Shellfish'],
        medications: ['Aspirin', 'Metoprolol'],
        vitalSigns: {
          heartRate: 95,
          bloodPressureSystolic: 140,
          bloodPressureDiastolic: 90,
          oxygenSaturation: 92,
          respiratoryRate: 18,
          temperature: 37.2,
          consciousness: 'alert',
          painLevel: 7
        }
      },
      {
        id: '2',
        driverName: 'Sarah Wilson',
        driverPhone: '+1 (555) 987-6543',
        ambulanceNumber: 'EMT-015',
        currentLocation: [-74.0160, 40.7228],
        eta: new Date(Date.now() + 15 * 60000),
        distance: 4.1,
        trafficStatus: 'light',
        patientInfo: 'Motor vehicle accident, multiple injuries',
        status: 'approaching',
        emergencyType: 'Trauma',
        severity: 'high',
        allergies: ['None known'],
        medications: ['Morphine', 'Saline'],
        vitalSigns: {
          heartRate: 110,
          bloodPressureSystolic: 85,
          bloodPressureDiastolic: 50,
          oxygenSaturation: 88,
          respiratoryRate: 22,
          temperature: 36.8,
          consciousness: 'drowsy',
          painLevel: 9
        }
      }
    ];

    setIncomingAmbulances(mockAmbulances);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setIncomingAmbulances(prev => 
        prev.map(ambulance => ({
          ...ambulance,
          eta: new Date(ambulance.eta.getTime() - 60000), // Decrease ETA by 1 minute
          distance: Math.max(0.1, ambulance.distance - 0.2), // Decrease distance
          vitalSigns: {
            ...ambulance.vitalSigns,
            // Simulate dynamic vital sign changes
            heartRate: Math.max(60, Math.min(150, ambulance.vitalSigns.heartRate + (Math.random() - 0.5) * 10)),
            oxygenSaturation: Math.max(80, Math.min(100, ambulance.vitalSigns.oxygenSaturation + (Math.random() - 0.5) * 3)),
            bloodPressureSystolic: Math.max(80, Math.min(180, ambulance.vitalSigns.bloodPressureSystolic + (Math.random() - 0.5) * 8))
          }
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

  const getSeverityBadgeVariant = (severity: 'critical' | 'high' | 'moderate' | 'low') => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      case 'low': return 'default';
    }
  };

  const getVitalStatusColor = (vital: string, value: number) => {
    switch (vital) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'text-destructive';
        return 'text-success';
      case 'oxygenSaturation':
        if (value < 95) return 'text-destructive';
        if (value < 98) return 'text-warning';
        return 'text-success';
      case 'bloodPressure':
        if (value > 140 || value < 90) return 'text-destructive';
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  const handleContactDriver = (ambulance: IncomingAmbulance) => {
    toast({
      title: "Driver Contact Information",
      description: `${ambulance.driverName}: ${ambulance.driverPhone}`,
      duration: 10000,
    });
  };

  const handleTrackLocation = (ambulance: IncomingAmbulance) => {
    setSelectedAmbulance(ambulance);
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
                   <div key={ambulance.id} className="border rounded-lg p-4 space-y-4">
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
                         <Badge variant={getSeverityBadgeVariant(ambulance.severity)}>
                           {ambulance.severity}
                         </Badge>
                         <Badge variant={getStatusBadgeVariant(ambulance.status)}>
                           {ambulance.status}
                         </Badge>
                         <Badge variant={getTrafficBadgeVariant(ambulance.trafficStatus)}>
                           {ambulance.trafficStatus} traffic
                         </Badge>
                       </div>
                     </div>

                     <Separator />

                     {/* Emergency Type and Basic Info */}
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                       <div className="flex items-center gap-2">
                         <Clock className="w-4 h-4 text-muted-foreground" />
                         <span>ETA: {formatTimeRemaining(ambulance.eta)}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-muted-foreground" />
                         <span>Distance: {ambulance.distance.toFixed(1)} km</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                         <span>{ambulance.emergencyType}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Navigation className="w-4 h-4 text-muted-foreground" />
                         <span>Route optimized</span>
                       </div>
                     </div>

                     <Separator />

                     {/* Critical Vital Signs */}
                     <div>
                       <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                         <Heart className="w-4 h-4 text-emergency" />
                         Live Vital Signs
                       </h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="bg-card p-3 rounded-lg border">
                           <div className="flex items-center gap-2 mb-1">
                             <Heart className="w-3 h-3 text-emergency" />
                             <span className="text-xs text-muted-foreground">Heart Rate</span>
                           </div>
                           <p className={`text-lg font-bold ${getVitalStatusColor('heartRate', ambulance.vitalSigns.heartRate)}`}>
                             {Math.round(ambulance.vitalSigns.heartRate)} bpm
                           </p>
                         </div>
                         <div className="bg-card p-3 rounded-lg border">
                           <div className="flex items-center gap-2 mb-1">
                             <Gauge className="w-3 h-3 text-primary" />
                             <span className="text-xs text-muted-foreground">Blood Pressure</span>
                           </div>
                           <p className={`text-lg font-bold ${getVitalStatusColor('bloodPressure', ambulance.vitalSigns.bloodPressureSystolic)}`}>
                             {Math.round(ambulance.vitalSigns.bloodPressureSystolic)}/{Math.round(ambulance.vitalSigns.bloodPressureDiastolic)}
                           </p>
                         </div>
                         <div className="bg-card p-3 rounded-lg border">
                           <div className="flex items-center gap-2 mb-1">
                             <Zap className="w-3 h-3 text-blue-500" />
                             <span className="text-xs text-muted-foreground">O2 Sat</span>
                           </div>
                           <p className={`text-lg font-bold ${getVitalStatusColor('oxygenSaturation', ambulance.vitalSigns.oxygenSaturation)}`}>
                             {Math.round(ambulance.vitalSigns.oxygenSaturation)}%
                           </p>
                         </div>
                         <div className="bg-card p-3 rounded-lg border">
                           <div className="flex items-center gap-2 mb-1">
                             <Thermometer className="w-3 h-3 text-orange-500" />
                             <span className="text-xs text-muted-foreground">Temperature</span>
                           </div>
                           <p className="text-lg font-bold">
                             {ambulance.vitalSigns.temperature.toFixed(1)}°C
                           </p>
                         </div>
                       </div>
                     </div>

                     {/* Additional Medical Info */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <h4 className="font-medium text-sm mb-2">Medical History</h4>
                         <div className="text-sm space-y-1">
                           <div>
                             <span className="text-muted-foreground">Allergies: </span>
                             <span className="font-medium text-destructive">
                               {ambulance.allergies.join(', ')}
                             </span>
                           </div>
                           <div>
                             <span className="text-muted-foreground">Current Medications: </span>
                             <span>{ambulance.medications.join(', ')}</span>
                           </div>
                         </div>
                       </div>
                       <div>
                         <h4 className="font-medium text-sm mb-2">Assessment</h4>
                         <div className="text-sm space-y-1">
                           <div>
                             <span className="text-muted-foreground">Consciousness: </span>
                             <Badge variant={ambulance.vitalSigns.consciousness === 'alert' ? 'default' : 'destructive'}>
                               {ambulance.vitalSigns.consciousness}
                             </Badge>
                           </div>
                           <div>
                             <span className="text-muted-foreground">Pain Level: </span>
                             <span className="font-medium text-warning">
                               {ambulance.vitalSigns.painLevel}/10
                             </span>
                           </div>
                           <div>
                             <span className="text-muted-foreground">Respiratory Rate: </span>
                             <span>{ambulance.vitalSigns.respiratoryRate}/min</span>
                           </div>
                         </div>
                       </div>
                     </div>

                     {ambulance.patientInfo && (
                       <>
                         <Separator />
                         <div>
                           <h4 className="font-medium text-sm mb-1">Additional Notes:</h4>
                           <p className="text-sm text-muted-foreground">{ambulance.patientInfo}</p>
                         </div>
                       </>
                     )}

                    <div className="flex gap-2">
                      <Button 
                        variant="medical" 
                        size="sm"
                        onClick={() => handleContactDriver(ambulance)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Driver
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTrackLocation(ambulance)}
                          >
                            <MapIcon className="w-4 h-4 mr-2" />
                            Track Location
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>
                              Tracking {ambulance.ambulanceNumber} - {ambulance.driverName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{ambulance.driverPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>ETA: {formatTimeRemaining(ambulance.eta)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>Distance: {ambulance.distance.toFixed(1)} km</span>
                              </div>
                            </div>
                            <div className="h-96 w-full flex flex-col">
                              <Map
                                ambulanceLocation={ambulance.currentLocation}
                                hospitalLocation={hospitalLocation}
                                className="h-full w-full rounded-lg border min-h-0 flex-1"
                              />
                            </div>
                            {ambulance.patientInfo && (
                              <div className="border rounded-lg p-3 bg-muted/50">
                                <h4 className="font-medium text-sm mb-1">Patient Information:</h4>
                                <p className="text-sm text-muted-foreground">{ambulance.patientInfo}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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

        {/* QoS Network Analytics */}
        <QosVisualization />
      </div>
    </div>
  );
};

export default HospitalDashboard;