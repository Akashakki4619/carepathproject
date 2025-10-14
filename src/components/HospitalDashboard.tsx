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
  Eye,
  FileText
} from 'lucide-react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import SimpleMap from '@/components/SimpleMap';
import QosVisualization from '@/components/QosVisualization';
import { RouteOptimization, TrafficCondition } from '@/types';
import { findOptimalRoute } from '@/utils/routing';

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
  const [showEHR, setShowEHR] = useState(false);
  const [selectedPatientEHR, setSelectedPatientEHR] = useState<IncomingAmbulance | null>(null);
  const [hospitalStats, setHospitalStats] = useState({
    totalBeds: 150,
    occupiedBeds: 98,
    emergencyBeds: 25,
    availableEmergencyBeds: 8,
    staffOnDuty: 52,
    currentLoad: 78,
    icuBeds: 12,
    availableIcuBeds: 3,
    operatingRooms: 6,
    availableOperatingRooms: 2,
    totalStaff: 68,
    surgeons: 8,
    nurses: 32,
    emergencyDoctors: 6
  });
  const { toast } = useToast();
  
  // Hospital location (Apollo Hospital, Jubilee Hills, Hyderabad - on land)
  const hospitalLocation: [number, number] = [78.4011, 17.4329];

  // Simulate incoming ambulances with complete realistic data
  useEffect(() => {
    const mockAmbulances: IncomingAmbulance[] = [
      {
        id: '1',
        driverName: 'Michael Rodriguez',
        driverPhone: '+91 98765 43210',
        ambulanceNumber: 'AMB-2401',
        currentLocation: [78.4200, 17.4100], // Banjara Hills, Hyderabad
        eta: new Date(Date.now() + 6 * 60000),
        distance: 1.8,
        trafficStatus: 'moderate',
        patientInfo: '67-year-old male experiencing chest pain and shortness of breath. Patient is conscious and responsive. Started IV and administered nitroglycerin.',
        status: 'approaching',
        emergencyType: 'Cardiac Emergency',
        severity: 'critical',
        allergies: ['Penicillin', 'Latex', 'Shellfish'],
        medications: ['Lisinopril 10mg daily', 'Metoprolol 50mg twice daily', 'Atorvastatin 40mg nightly'],
        vitalSigns: {
          heartRate: 98,
          bloodPressureSystolic: 165,
          bloodPressureDiastolic: 95,
          oxygenSaturation: 94,
          respiratoryRate: 20,
          temperature: 37.1,
          consciousness: 'alert',
          painLevel: 8
        }
      },
      {
        id: '2',
        driverName: 'Sarah Chen',
        driverPhone: '+91 98765 43211',
        ambulanceNumber: 'AMB-1205',
        currentLocation: [78.4500, 17.4400], // Somajiguda, Hyderabad
        eta: new Date(Date.now() + 12 * 60000),
        distance: 3.2,
        trafficStatus: 'light',
        patientInfo: '34-year-old female involved in motorcycle accident. Multiple lacerations and suspected fracture of left tibia. Patient is stable.',
        status: 'approaching',
        emergencyType: 'Trauma - Motor Vehicle Accident',
        severity: 'high',
        allergies: ['Codeine', 'NSAIDS'],
        medications: ['Birth control pills', 'Vitamin D3', 'Emergency morphine 5mg administered'],
        vitalSigns: {
          heartRate: 105,
          bloodPressureSystolic: 110,
          bloodPressureDiastolic: 72,
          oxygenSaturation: 97,
          respiratoryRate: 18,
          temperature: 36.9,
          consciousness: 'alert',
          painLevel: 7
        }
      },
      {
        id: '3',
        driverName: 'James Thompson',
        driverPhone: '+91 98765 43212',
        ambulanceNumber: 'AMB-0847',
        currentLocation: [78.4600, 17.4300], // Panjagutta, Hyderabad
        eta: new Date(Date.now() + 18 * 60000),
        distance: 4.7,
        trafficStatus: 'heavy',
        patientInfo: '45-year-old construction worker fell from scaffolding. Possible head injury and spinal trauma. C-collar applied, patient immobilized.',
        status: 'approaching',
        emergencyType: 'Trauma - Fall from Height',
        severity: 'critical',
        allergies: ['No known allergies'],
        medications: ['Ibuprofen as needed', 'Fentanyl 100mcg administered for pain'],
        vitalSigns: {
          heartRate: 88,
          bloodPressureSystolic: 95,
          bloodPressureDiastolic: 58,
          oxygenSaturation: 91,
          respiratoryRate: 16,
          temperature: 36.5,
          consciousness: 'drowsy',
          painLevel: 9
        }
      },
      {
        id: '4',
        driverName: 'Lisa Anderson',
        driverPhone: '+91 98765 43213',
        ambulanceNumber: 'AMB-1963',
        currentLocation: [78.4350, 17.4200], // Ameerpet, Hyderabad
        eta: new Date(Date.now() + 22 * 60000),
        distance: 5.1,
        trafficStatus: 'moderate',
        patientInfo: '28-year-old pregnant female (32 weeks) experiencing severe abdominal pain and bleeding. Vitals stable, possible placental abruption.',
        status: 'approaching',
        emergencyType: 'Obstetric Emergency',
        severity: 'high',
        allergies: ['Aspirin'],
        medications: ['Prenatal vitamins', 'Iron supplements', 'IV fluids running'],
        vitalSigns: {
          heartRate: 112,
          bloodPressureSystolic: 138,
          bloodPressureDiastolic: 88,
          oxygenSaturation: 98,
          respiratoryRate: 22,
          temperature: 37.3,
          consciousness: 'alert',
          painLevel: 8
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

  const handleShowEHR = (ambulance: IncomingAmbulance) => {
    setSelectedPatientEHR(ambulance);
    setShowEHR(true);
  };

  // Generate route and traffic conditions for selected ambulance
  const getRouteForAmbulance = (ambulance: IncomingAmbulance): { route: RouteOptimization; trafficConditions: TrafficCondition[] } => {
    const trafficConditions: TrafficCondition[] = [
      {
        road_segment: `Route to ${ambulance.ambulanceNumber}`,
        coordinates: [ambulance.currentLocation, hospitalLocation],
        traffic_level: ambulance.trafficStatus,
        estimated_delay: ambulance.trafficStatus === 'heavy' ? 5 : ambulance.trafficStatus === 'moderate' ? 2 : 0,
        last_updated: new Date()
      }
    ];
    
    const route = findOptimalRoute(ambulance.currentLocation, hospitalLocation, trafficConditions);
    return { route, trafficConditions };
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
                       <Button 
                         size="sm" 
                         variant="outline"
                         onClick={() => handleShowEHR(ambulance)}
                       >
                         <FileText className="h-4 w-4 mr-1" />
                         EHR
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
                              {(() => {
                                const { route, trafficConditions } = getRouteForAmbulance(ambulance);
                                return (
                                  <SimpleMap
                                    route={route}
                                    ambulanceLocation={ambulance.currentLocation}
                                    hospitalLocation={hospitalLocation}
                                    trafficConditions={trafficConditions}
                                    className="h-full w-full rounded-lg border min-h-0 flex-1"
                                  />
                                );
                              })()}
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

        {/* Resource Status */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Status</CardTitle>
            <CardDescription>
              Current hospital capacity and resource allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Emergency Beds</span>
                  <span>{hospitalStats.availableEmergencyBeds}/{hospitalStats.emergencyBeds}</span>
                </div>
                <Progress value={(hospitalStats.availableEmergencyBeds / hospitalStats.emergencyBeds) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>ICU Beds</span>
                  <span>{hospitalStats.availableIcuBeds}/{hospitalStats.icuBeds}</span>
                </div>
                <Progress value={(hospitalStats.availableIcuBeds / hospitalStats.icuBeds) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Operating Rooms</span>
                  <span>{hospitalStats.availableOperatingRooms}/{hospitalStats.operatingRooms}</span>
                </div>
                <Progress value={(hospitalStats.availableOperatingRooms / hospitalStats.operatingRooms) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Electronic Health Record Dialog */}
      <Dialog open={showEHR} onOpenChange={setShowEHR}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Electronic Health Record - Patient ({selectedPatientEHR?.ambulanceNumber})
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatientEHR && (
            <div className="space-y-6">
              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                    <p className="text-sm">{selectedPatientEHR.ambulanceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emergency Type</p>
                    <p className="text-sm">{selectedPatientEHR.emergencyType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="text-sm">Male</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Blood Type</p>
                    <p className="text-sm">O+</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact</p>
                    <p className="text-sm">+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                    <p className="text-sm">Jane Doe (Spouse) - +1 (555) 987-6543</p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Health Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Health Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Heart Rate</span>
                      </div>
                      <p className="text-lg font-semibold">{selectedPatientEHR.vitalSigns.heartRate} BPM</p>
                      <Badge variant={selectedPatientEHR.vitalSigns.heartRate > 100 ? "destructive" : "secondary"} className="text-xs">
                        {selectedPatientEHR.vitalSigns.heartRate > 100 ? "High" : "Normal"}
                      </Badge>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Blood Pressure</span>
                      </div>
                      <p className="text-lg font-semibold">{selectedPatientEHR.vitalSigns.bloodPressureSystolic}/{selectedPatientEHR.vitalSigns.bloodPressureDiastolic}</p>
                      <Badge variant="secondary" className="text-xs">Normal</Badge>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Oxygen Level</span>
                      </div>
                      <p className="text-lg font-semibold">{selectedPatientEHR.vitalSigns.oxygenSaturation}%</p>
                      <Badge variant={selectedPatientEHR.vitalSigns.oxygenSaturation < 95 ? "destructive" : "secondary"} className="text-xs">
                        {selectedPatientEHR.vitalSigns.oxygenSaturation < 95 ? "Low" : "Normal"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Current Condition</p>
                    <p className="text-sm">{selectedPatientEHR.emergencyType} - {selectedPatientEHR.severity} severity</p>
                  </div>
                </CardContent>
              </Card>

              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Past Illnesses & Surgeries</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Appendectomy (2019)</li>
                      <li>• Hypertension (diagnosed 2020)</li>
                      <li>• Seasonal allergies</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Current Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Lisinopril 10mg daily</Badge>
                      <Badge variant="outline">Aspirin 81mg daily</Badge>
                      <Badge variant="outline">Metformin 500mg twice daily</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Known Allergies</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="destructive">Penicillin</Badge>
                      <Badge variant="destructive">Shellfish</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Immunization Records */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Immunization Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">COVID-19 Vaccine</p>
                      <p className="text-sm text-muted-foreground">Pfizer-BioNTech (Booster: Sep 2023)</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Flu Vaccine</p>
                      <p className="text-sm text-muted-foreground">Annual (Last: Oct 2023)</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tetanus</p>
                      <p className="text-sm text-muted-foreground">Updated: Mar 2022</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hepatitis B</p>
                      <p className="text-sm text-muted-foreground">Series completed: 2018</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Lab Results & Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Blood Work (Last Week)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Glucose</p>
                        <p className="text-muted-foreground">92 mg/dL (Normal)</p>
                      </div>
                      <div>
                        <p className="font-medium">Cholesterol</p>
                        <p className="text-muted-foreground">185 mg/dL (Normal)</p>
                      </div>
                      <div>
                        <p className="font-medium">Hemoglobin</p>
                        <p className="text-muted-foreground">14.2 g/dL (Normal)</p>
                      </div>
                      <div>
                        <p className="font-medium">Creatinine</p>
                        <p className="text-muted-foreground">0.9 mg/dL (Normal)</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Recent Imaging</h4>
                    <p className="text-sm text-muted-foreground">Chest X-ray (3 days ago): No acute abnormalities detected</p>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Immediate Care</h4>
                      <p className="text-sm text-muted-foreground">{selectedPatientEHR.emergencyType} - Monitor vital signs, administer IV fluids as needed</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Follow-up Required</h4>
                      <p className="text-sm text-muted-foreground">Cardiology consultation within 24 hours, continue blood pressure monitoring</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Doctor's Notes</h4>
                      <p className="text-sm text-muted-foreground">Patient responsive and stable. Continue current treatment protocol. Monitor for any changes in condition.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalDashboard;