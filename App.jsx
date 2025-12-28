import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import SOSButton from './SOSButton';
import ComplaintForm from './ComplaintForm';
import AdminDashboard from './AdminDashboard';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const themeOptions = [
    { value: 'light', label: '☀️ Light', description: 'Classic bright theme' },
    { value: 'dark', label: '🌙 Dark', description: 'Original dark theme' },
    { value: 'dark-sunset', label: '🌅 Sunset Blaze', description: 'Hot pink & orange fire' },
    { value: 'dark-electric', label: '⚡ Electric Dreams', description: 'Neon green & cyan energy' },
    { value: 'dark-aurora', label: '🌌 Aurora Borealis', description: 'Purple, pink & cyan lights' },
    { value: 'dark-toxic', label: '☢️ Toxic Glow', description: 'Radioactive lime & magenta' },
    { value: 'dark-lava', label: '🌋 Lava Flow', description: 'Molten orange & yellow heat' },
    { value: 'dark-deepsea', label: '🐋 Deep Sea', description: 'Bright cyan & electric blue' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Close theme menu when clicking outside
    const handleClickOutside = (e) => {
      if (showThemeMenu && !e.target.closest('.theme-selector-container')) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showThemeMenu]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  const getCurrentThemeLabel = () => {
    const current = themeOptions.find(opt => opt.value === theme);
    return current ? current.label : '🌙 Theme';
  };

  const fetchCurrentUser = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {/* Theme Selector */}
        <div className="theme-selector-container">
          <button 
            className="theme-toggle" 
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            aria-label="Select theme"
            title="Choose your theme"
          >
            <span style={{ fontSize: '1rem' }}>{getCurrentThemeLabel()}</span>
          </button>
          
          {showThemeMenu && (
            <div className="theme-menu">
              {themeOptions.map(option => (
                <button
                  key={option.value}
                  className={`theme-option ${theme === option.value ? 'active' : ''}`}
                  onClick={() => changeTheme(option.value)}
                >
                  <div className="theme-option-header">
                    <span className="theme-option-label">{option.label}</span>
                    {theme === option.value && <span className="theme-checkmark">✓</span>}
                  </div>
                  <span className="theme-option-description">{option.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/sos" 
            element={user ? <SOSButton user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/complaint" 
            element={user ? <ComplaintForm user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
