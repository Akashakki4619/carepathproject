import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import MainNavigation from '@/components/MainNavigation';
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

  return <MainNavigation user={currentUser} onLogout={handleLogout} />;
};

export default Index;
