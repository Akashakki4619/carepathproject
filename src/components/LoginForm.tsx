import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ambulance, Heart, Shield } from 'lucide-react';
import { User } from '@/types';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'ambulance_driver' as 'ambulance_driver' | 'hospital_staff'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock user data for demonstration
    const mockUser: User = {
      id: Math.random().toString(),
      name: loginData.role === 'ambulance_driver' ? 'John Driver' : 'Dr. Sarah Wilson',
      email: loginData.email,
      role: loginData.role,
      hospital_id: loginData.role === 'hospital_staff' ? 'hospital_1' : undefined,
      ambulance_id: loginData.role === 'ambulance_driver' ? 'amb_001' : undefined
    };

    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emergency-light to-medical-light p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-hero rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Emergency Routing System</CardTitle>
          <CardDescription>
            Secure access for emergency medical services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginData.role} onValueChange={(value) => 
            setLoginData(prev => ({ ...prev, role: value as 'ambulance_driver' | 'hospital_staff' }))
          }>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ambulance_driver" className="flex items-center gap-2">
                <Ambulance className="w-4 h-4" />
                Driver
              </TabsTrigger>
              <TabsTrigger value="hospital_staff" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Hospital
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="ambulance_driver" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driver-email">Driver ID / Email</Label>
                  <Input
                    id="driver-email"
                    type="email"
                    placeholder="driver@ems.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-password">Password</Label>
                  <Input
                    id="driver-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" variant="emergency" className="w-full">
                  Access Driver Dashboard
                </Button>
              </TabsContent>

              <TabsContent value="hospital_staff" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Staff Email</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="staff@hospital.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Password</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" variant="medical" className="w-full">
                  Access Hospital Dashboard
                </Button>
              </TabsContent>
            </form>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo Credentials:</p>
            <p>Email: demo@system.com | Password: any</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;