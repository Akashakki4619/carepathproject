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
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ambulance_driver' as 'ambulance_driver' | 'hospital_staff'
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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
          // Fetch user role from user_roles table
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

          if (roleError) throw roleError;

          const user: User = {
            id: data.user.id,
            name: `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim(),
            email: data.user.email!,
            role: roleData.role as 'ambulance_driver' | 'hospital_staff',
            hospital_id: roleData.role === 'hospital_staff' ? 'hospital_1' : undefined,
            ambulance_id: roleData.role === 'ambulance_driver' ? 'amb_001' : undefined
          };

          onLogin(user);
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
        }
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email: loginData.email,
          password: loginData.password,
          options: {
            data: {
              first_name: loginData.firstName,
              last_name: loginData.lastName,
              role: loginData.role,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Signup successful",
          description: "Please check your email to confirm your account.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="ambulance_driver" className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="driver-first-name">First Name</Label>
                      <Input
                        id="driver-first-name"
                        type="text"
                        placeholder="John"
                        value={loginData.firstName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver-last-name">Last Name</Label>
                      <Input
                        id="driver-last-name"
                        type="text"
                        placeholder="Driver"
                        value={loginData.lastName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="driver-email">Email</Label>
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
                    minLength={6}
                  />
                </div>
                <Button type="submit" variant="emergency" className="w-full" disabled={loading}>
                  {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                </Button>
              </TabsContent>

              <TabsContent value="hospital_staff" className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="staff-first-name">First Name</Label>
                      <Input
                        id="staff-first-name"
                        type="text"
                        placeholder="Sarah"
                        value={loginData.firstName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staff-last-name">Last Name</Label>
                      <Input
                        id="staff-last-name"
                        type="text"
                        placeholder="Wilson"
                        value={loginData.lastName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email</Label>
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
                    minLength={6}
                  />
                </div>
                <Button type="submit" variant="medical" className="w-full" disabled={loading}>
                  {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                </Button>
              </TabsContent>
            </form>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;