import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import DriverDashboard from '@/components/DriverDashboard';
import HospitalDashboard from '@/components/HospitalDashboard';
import { User } from '@/types';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (currentUser.role === 'ambulance_driver') {
    return <DriverDashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === 'hospital_staff') {
    return <HospitalDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return null;
};

export default Index;
