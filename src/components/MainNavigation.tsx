import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverDashboard from './DriverDashboard';
import HospitalDashboard from './HospitalDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import { BarChart3, Ambulance, Building2 } from 'lucide-react';

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
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              {/* Right spacer retained to keep layout flexible; remove if unnecessary */}
              <div className="ml-auto" />
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          {user?.role === 'hospital_staff' ? (
            <HospitalDashboard user={user} onLogout={onLogout} />
          ) : (
            <DriverDashboard user={user} onLogout={onLogout} />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <AnalyticsDashboard />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default MainNavigation;