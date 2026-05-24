import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const isVercel = () => {
  return window.location.hostname.includes('vercel');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVercel()) {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        setUser(JSON.parse(localUser));
      } else {
        const adminUser = {
          id: 1,
          username: 'admin',
          email: 'admin@usf.org.pk',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'ADMIN',
          is_active: true
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('access_token', 'mock-access-token');
        localStorage.setItem('refresh_token', 'mock-refresh-token');
        setUser(adminUser);
      }
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/profile/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    if (isVercel()) {
      const mockUser = {
        id: 1,
        username: username || 'admin',
        email: `${username || 'admin'}@usf.org.pk`,
        first_name: username ? username.charAt(0).toUpperCase() + username.slice(1) : 'Super',
        last_name: username ? 'User' : 'Admin',
        role: username.toLowerCase() === 'manager' ? 'NGO_MANAGER' : 
              username.toLowerCase() === 'coordinator' ? 'FIELD_COORDINATOR' :
              username.toLowerCase() === 'donor_view' ? 'DONOR' : 'ADMIN',
        is_active: true
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
      setUser(mockUser);
      return mockUser;
    }

    const res = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    const profileRes = await api.get('/auth/profile/');
    setUser(profileRes.data);
    return profileRes.data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (isVercel()) {
      localStorage.removeItem('mock_db');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
