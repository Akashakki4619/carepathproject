import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ambulance, Heart, Shield } from 'lucide-react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'ambulance_driver' as 'ambulance_driver' | 'hospital_staff'
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password,
        });

        if (error) throw error;

        if (data.user) {
          // Get role from user metadata set during signup
          const userRole = data.user.user_metadata?.role || loginData.role;
          const firstName = data.user.user_metadata?.first_name || '';
          const lastName = data.user.user_metadata?.last_name || '';
          
          const mockUser: User = {
            id: data.user.id,
            name: `${firstName} ${lastName}`.trim() || 'User',
            email: data.user.email || '',
            role: userRole === 'hospital' || userRole === 'hospital_staff' ? 'hospital_staff' : 'ambulance_driver',
            hospital_id: userRole === 'hospital' || userRole === 'hospital_staff' ? 'hospital_1' : undefined,
            ambulance_id: userRole === 'driver' || userRole === 'ambulance_driver' ? 'amb_001' : undefined
          };

          onLogin(mockUser);
        }
      } else {
        // Sign up
        const roleToStore = loginData.role === 'ambulance_driver' ? 'driver' : 'hospital';
        
        const { data, error } = await supabase.auth.signUp({
          email: loginData.email,
          password: loginData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              role: roleToStore
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created successfully!",
          description: "You can now log in with your credentials.",
        });
        
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isLogin ? "Login failed" : "Sign up failed",
        description: error.message || "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
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

            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant={isLogin ? "default" : "outline"}
                className="flex-1"
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                type="button"
                variant={!isLogin ? "default" : "outline"}
                className="flex-1"
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
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
                    disabled={loading}
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
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <Button type="submit" variant="emergency" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : (isLogin ? "Access Driver Dashboard" : "Create Driver Account")}
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
                    disabled={loading}
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
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <Button type="submit" variant="medical" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : (isLogin ? "Access Hospital Dashboard" : "Create Hospital Account")}
                </Button>
              </TabsContent>
            </form>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>{isLogin ? "Don't have an account? Click Sign Up above." : "Already have an account? Click Login above."}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;