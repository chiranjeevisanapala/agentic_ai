import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/auth';

interface AuthContextType {
  user: User;
  setRole: (role: 'customer' | 'agent' | 'admin') => void;
}

const DEFAULT_USER: User = {
  id: 'usr-agent-1',
  email: 'agent@support.ai',
  full_name: 'David Miller (Support Agent)',
  role: 'agent',
  is_active: true,
  created_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  const setRole = (role: 'customer' | 'agent' | 'admin') => {
    let name = 'David Miller (Support Agent)';
    let email = 'agent@support.ai';
    if (role === 'customer') {
      name = 'Alex Rivera (Customer)';
      email = 'alex.rivera@techcorp.io';
    } else if (role === 'admin') {
      name = 'Sarah Jenkins (Supervisor / Admin)';
      email = 'admin@support.ai';
    }
    setUser({
      ...user,
      role,
      full_name: name,
      email
    });
  };

  return (
    <AuthContext.Provider value={{ user, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
