import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverDashboard from './DriverDashboard';
import HospitalDashboard from './HospitalDashboard';
import PatientManagement from './PatientManagement';
import CommunicationCenter from './CommunicationCenter';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserManagement from './UserManagement';
import { Users, MessageSquare, BarChart3, Settings, Ambulance, Building2, User, Activity } from 'lucide-react';
import LiveTracking from './LiveTracking';
import MapMarkerTest from './MapMarkerTest';
import SimpleMapTest from './SimpleMapTest';

interface MainNavigationProps {
  user: any;
  onLogout: () => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="container mx-auto px-4">
            <TabsList className="h-16 w-full justify-start space-x-8">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                {user?.role === 'ambulance_driver' ? <Ambulance className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="patients" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Patients</span>
              </TabsTrigger>
              <TabsTrigger value="communication" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Communication</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Live Tracking</span>
              </TabsTrigger>
              <TabsTrigger value="map-test" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Map Test</span>
              </TabsTrigger>
              <TabsTrigger value="simple-map" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Simple Map</span>
              </TabsTrigger>
              <div className="ml-auto">
                <Button variant="outline" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          {user?.role === 'ambulance_driver' || user?.role === 'driver' ? (
            <DriverDashboard user={user} onLogout={onLogout} />
          ) : (
            <HospitalDashboard user={user} onLogout={onLogout} />
          )}
        </TabsContent>

        <TabsContent value="patients" className="mt-0">
          <PatientManagement />
        </TabsContent>

        <TabsContent value="communication" className="mt-0">
          <CommunicationCenter currentUserId={user?.id} userRole={user?.role} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <UserManagement />
        </TabsContent>

        <TabsContent value="tracking" className="mt-0">
          <LiveTracking />
        </TabsContent>

        <TabsContent value="map-test" className="mt-0">
          <MapMarkerTest />
        </TabsContent>

        <TabsContent value="simple-map" className="mt-0">
          <SimpleMapTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MainNavigation;