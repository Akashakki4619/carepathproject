import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import MainNavigation from '@/components/MainNavigation';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const user: User = {
              id: session.user.id,
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
              role: profile.role === 'driver' ? 'ambulance_driver' : 'hospital_staff',
              email: session.user.email!,
            };
            setCurrentUser(user);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const user: User = {
                id: session.user.id,
                name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
                role: profile.role === 'driver' ? 'ambulance_driver' : 'hospital_staff',
                email: session.user.email!,
              };
              setCurrentUser(user);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
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
