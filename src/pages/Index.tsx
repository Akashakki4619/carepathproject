import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import MainNavigation from '@/components/MainNavigation';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const { data: { user } } = await supabase.auth.getUser();

      if (user && roleData) {
        const userData: User = {
          id: user.id,
          name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
          email: user.email!,
          role: roleData.role as 'ambulance_driver' | 'hospital_staff',
          hospital_id: roleData.role === 'hospital_staff' ? 'hospital_1' : undefined,
          ambulance_id: roleData.role === 'ambulance_driver' ? 'amb_001' : undefined
        };
        setCurrentUser(userData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <MainNavigation user={currentUser} onLogout={handleLogout} />;
};

export default Index;
