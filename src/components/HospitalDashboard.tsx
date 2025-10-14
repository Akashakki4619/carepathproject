import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Users,
  Bed,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { User } from '@/types';

interface HospitalDashboardProps {
  user: User;
  onLogout: () => void;
}

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, onLogout }) => {
  const hospitalStats = {
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
              <h1 className="text-xl font-bold">Yashoda Hospital Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {user.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>Logout</Button>
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

        {/* Resource Status */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Status</CardTitle>
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
    </div>
  );
};

export default HospitalDashboard;
