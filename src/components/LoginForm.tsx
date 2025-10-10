import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ambulance, Heart, Shield } from 'lucide-react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ambulance_driver' as 'ambulance_driver' | 'hospital_staff'
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: loginData.email,
        password: loginData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: loginData.firstName,
            last_name: loginData.lastName,
            role: loginData.role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "You can now login with your credentials.",
      });

      setIsSignUp(false);
      setLoginData(prev => ({ ...prev, firstName: '', lastName: '', password: '' }));
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const user: User = {
            id: data.user.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
            role: profile.role === 'driver' ? 'ambulance_driver' : 'hospital_staff',
            email: data.user.email!,
          };
          onLogin(user);
        }
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            {isSignUp ? 'Create a new account' : 'Secure access for emergency medical services'}
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

            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              <TabsContent value="ambulance_driver" className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="driver-firstname">First Name</Label>
                      <Input
                        id="driver-firstname"
                        type="text"
                        placeholder="John"
                        value={loginData.firstName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver-lastname">Last Name</Label>
                      <Input
                        id="driver-lastname"
                        type="text"
                        placeholder="Doe"
                        value={loginData.lastName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}
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
                    placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="emergency" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : isSignUp ? 'Sign Up as Driver' : 'Access Driver Dashboard'}
                </Button>
              </TabsContent>

              <TabsContent value="hospital_staff" className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="staff-firstname">First Name</Label>
                      <Input
                        id="staff-firstname"
                        type="text"
                        placeholder="Jane"
                        value={loginData.firstName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="staff-lastname">Last Name</Label>
                      <Input
                        id="staff-lastname"
                        type="text"
                        placeholder="Smith"
                        value={loginData.lastName}
                        onChange={(e) => setLoginData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </>
                )}
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
                    placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="medical" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : isSignUp ? 'Sign Up as Hospital Staff' : 'Access Hospital Dashboard'}
                </Button>
              </TabsContent>
            </form>

            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;