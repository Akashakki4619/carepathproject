import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Patient, MedicalHistory, EmergencyContact, MedicalAlert } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, AlertTriangle, Heart, Phone, Calendar as CalendarIcon, User } from 'lucide-react';

interface PatientManagementProps {
  onPatientSelect?: (patient: Patient) => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ onPatientSelect }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [medicalAlerts, setMedicalAlerts] = useState<MedicalAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetails(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name');
      
      if (error) throw error;
      setPatients((data || []) as Patient[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      });
    }
  };

  const fetchPatientDetails = async (patientId: string) => {
    try {
      const [historyResult, contactsResult, alertsResult] = await Promise.all([
        supabase.from('medical_history').select('*').eq('patient_id', patientId),
        supabase.from('emergency_contacts').select('*').eq('patient_id', patientId),
        supabase.from('medical_alerts').select('*').eq('patient_id', patientId).eq('is_active', true)
      ]);

      setMedicalHistory(historyResult.data || []);
      setEmergencyContacts(contactsResult.data || []);
      setMedicalAlerts((alertsResult.data || []) as MedicalAlert[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patient details",
        variant: "destructive"
      });
    }
  };

  const createPatient = async () => {
    if (!newPatient.first_name || !newPatient.last_name || !newPatient.date_of_birth) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([newPatient as any])
        .select()
        .single();

      if (error) throw error;
      
      setPatients([...patients, data as Patient]);
      setNewPatient({});
      setShowNewPatientDialog(false);
      toast({
        title: "Success",
        description: "Patient created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone_number?.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newPatient.first_name || ''}
                    onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newPatient.last_name || ''}
                    onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={newPatient.date_of_birth || ''}
                  onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setNewPatient({...newPatient, gender: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={newPatient.phone_number || ''}
                  onChange={(e) => setNewPatient({...newPatient, phone_number: e.target.value})}
                />
              </div>
              <Button onClick={createPatient} className="w-full">Create Patient</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-4 border-b cursor-pointer hover:bg-accent ${
                    selectedPatient?.id === patient.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => {
                    setSelectedPatient(patient);
                    onPatientSelect?.(patient);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-muted-foreground">
                        DOB: {format(new Date(patient.date_of_birth), 'MM/dd/yyyy')}
                      </p>
                      {patient.phone_number && (
                        <p className="text-sm text-muted-foreground">{patient.phone_number}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
                <TabsTrigger value="alerts">Medical Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <p className="text-lg">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date of Birth</Label>
                        <p>{format(new Date(selectedPatient.date_of_birth), 'MMMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <p className="capitalize">{selectedPatient.gender}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Blood Type</Label>
                        <p>{selectedPatient.blood_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p>{selectedPatient.phone_number || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Insurance</Label>
                        <p>{selectedPatient.insurance_number || 'Not provided'}</p>
                      </div>
                    </div>
                    {selectedPatient.address && (
                      <div>
                        <Label className="text-sm font-medium">Address</Label>
                        <p>{selectedPatient.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medicalHistory.length > 0 ? (
                        medicalHistory.map((history) => (
                          <div key={history.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold">{history.condition_name}</h4>
                                {history.diagnosed_date && (
                                  <p className="text-sm text-muted-foreground">
                                    Diagnosed: {format(new Date(history.diagnosed_date), 'MM/dd/yyyy')}
                                  </p>
                                )}
                                {history.medications.length > 0 && (
                                  <div className="mt-2">
                                    <Label className="text-sm font-medium">Medications:</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {history.medications.map((med, index) => (
                                        <Badge key={index} variant="outline">{med}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {history.allergies.length > 0 && (
                                  <div className="mt-2">
                                    <Label className="text-sm font-medium">Allergies:</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {history.allergies.map((allergy, index) => (
                                        <Badge key={index} variant="destructive">{allergy}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {history.notes && (
                                  <p className="text-sm mt-2">{history.notes}</p>
                                )}
                              </div>
                              <Badge variant={history.is_active ? "default" : "secondary"}>
                                {history.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No medical history recorded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts">
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {emergencyContacts.length > 0 ? (
                        emergencyContacts.map((contact) => (
                          <div key={contact.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{contact.name}</p>
                                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                                  <p className="text-sm">{contact.phone_number}</p>
                                  {contact.email && (
                                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                                  )}
                                </div>
                              </div>
                              {contact.is_primary && (
                                <Badge>Primary</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No emergency contacts recorded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {medicalAlerts.length > 0 ? (
                        medicalAlerts.map((alert) => (
                          <div key={alert.id} className="p-4 border rounded-lg">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                                alert.severity === 'critical' ? 'text-red-500' :
                                alert.severity === 'high' ? 'text-orange-500' :
                                alert.severity === 'medium' ? 'text-yellow-500' :
                                'text-blue-500'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium capitalize">{alert.alert_type} Alert</h4>
                                  <Badge variant={getSeverityColor(alert.severity)}>
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm mt-1">{alert.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No active medical alerts</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a patient to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;