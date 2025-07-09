import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '@/services/ApiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const userProfile = await ApiService.getCurrentUser();
          setUser(userProfile);
          localStorage.setItem('user', JSON.stringify(userProfile));
        } else {
          // Auto-login with default credentials for development
          console.log('No token found, attempting auto-login...');
          try {
            const response = await ApiService.login({ email: 'admin@demo.com', password: 'password' });
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        ApiService.logout();
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await ApiService.login({ email, password });
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await ApiService.register(userData);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    ApiService.logout();
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      // This would need to be implemented in the API
      // For now, just update local user state
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // This would need to be implemented in the API
      console.log('Change password:', currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;