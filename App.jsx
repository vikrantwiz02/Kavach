import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import SOSButton from './SOSButton';
import ComplaintForm from './ComplaintForm';
import AdminDashboard from './AdminDashboard';
import FakeCall from './FakeCall';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

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
          <Route 
            path="/fake-call" 
            element={user ? <FakeCall /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
