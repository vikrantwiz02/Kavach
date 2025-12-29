import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <h2>Welcome, {user.name}</h2>
            <p>Your protection, our priority</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/sos')}>
          <div className="card-icon">!</div>
          <h3>SOS Emergency</h3>
          <p>Protected & Ready</p>
          <button className="btn-card">Activate SOS</button>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/complaint')}>
          <div className="card-icon">R</div>
          <h3>Report Incident</h3>
          <p>
            Confidentially document incidents with secure evidence upload and location tracking
          </p>
          <button className="btn-card">File Report</button>
        </div>

        {user.role === 'admin' && (
          <div className="dashboard-card" onClick={() => navigate('/admin')}>
            <div className="card-icon" style={{ background: 'linear-gradient(135deg, var(--soft-clay-coral), var(--soft-clay-coral-light))' }}>A</div>
            <h3>Command Center</h3>
            <p>
              Monitor active alerts, track responses, and manage safety protocols in real-time
            </p>
            <button className="btn-card admin">Access Dashboard</button>
          </div>
        )}
      </div>

      <div className="emergency-contacts-display">
        <h3>Emergency Contacts</h3>
        {user.emergencyContacts?.length > 0 ? (
          user.emergencyContacts.map((contact, index) => (
            <div key={index} className="contact-card">
              <div className="contact-icon">C</div>
              <div className="contact-info">
                <div className="name">{contact.name}</div>
                <div className="phone">{contact.phone}</div>
                <div className="relation">{contact.relation}</div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-xl)' }}>
            No contacts configured
          </p>
        )}
      </div>

      <div className="emergency-contacts-display" style={{ marginTop: 'var(--space-2xl)' }}>
        <h3>Emergency Services</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          <a href="tel:100" className="contact-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="contact-icon">P</div>
            <div className="contact-info">
              <div className="name">Police</div>
              <div className="phone">100</div>
            </div>
          </a>
          <a href="tel:1091" className="contact-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="contact-icon">W</div>
            <div className="contact-info">
              <div className="name">Women Helpline</div>
              <div className="phone">1091</div>
            </div>
          </a>
          <a href="tel:102" className="contact-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="contact-icon">+</div>
            <div className="contact-info">
              <div className="name">Ambulance</div>
              <div className="phone">102</div>
            </div>
          </a>
          <a href="tel:181" className="contact-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="contact-icon">S</div>
            <div className="contact-info">
              <div className="name">Women Support</div>
              <div className="phone">181</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
