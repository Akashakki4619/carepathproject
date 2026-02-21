import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import MainNavigation from '@/components/MainNavigation';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loginHandledRef = React.useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async (userId: string) => {
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        const { data: { user } } = await supabase.auth.getUser();

        if (user && roleData && isMounted) {
          const userData: User = {
            id: user.id,
            name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 'User',
            email: user.email!,
            role: roleData.role as 'ambulance_driver' | 'hospital_staff',
            hospital_id: roleData.role === 'hospital_staff' ? 'hospital_1' : undefined,
            ambulance_id: roleData.role === 'ambulance_driver' ? 'amb_001' : undefined
          };
          setCurrentUser(userData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        // Skip if login was already handled by onLogin callback
        if (loginHandledRef.current) {
          loginHandledRef.current = false;
          return;
        }
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    loginHandledRef.current = true;
    setCurrentUser(user);
    setLoading(false);
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
