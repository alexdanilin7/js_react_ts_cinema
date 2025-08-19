import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Проверяем, есть ли токен/флаг в localStorage
    const savedAuth = localStorage.getItem('isAdminAuthenticated');
    setIsAuthenticated(savedAuth === 'true');
  }, []);

  const login = () => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};