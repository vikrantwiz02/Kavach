import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [liquidCoreHover, setLiquidCoreHover] = useState(false);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <h1>Welcome, {user.name}</h1>
            <p>Your protection, our priority</p>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          🔓 Logout
        </button>
      </header>
      
      {/* Breathing Liquid Core SOS */}
      <div className="liquid-core-container">
        <div 
          className="liquid-core"
          onMouseEnter={() => setLiquidCoreHover(true)}
          onMouseLeave={() => setLiquidCoreHover(false)}
          onClick={() => navigate('/sos')}
        >
          <div className="liquid-core-inner">
            <div className="liquid-core-icon">🛡️</div>
            <div className="liquid-core-text">SOS</div>
          </div>
        </div>
        <div className="liquid-core-status">
          {liquidCoreHover ? '✨ Tap to activate emergency protocol' : '🔒 Protected & Ready'}
        </div>
      </div>

      {/* Feature Cards with Protective Transparency */}
      <div className="dashboard-features">
        <div className="feature-card" onClick={() => navigate('/complaint')}>
          <div className="feature-icon">📝</div>
          <h2 className="feature-title">Report Incident</h2>
          <p className="feature-description">
            Confidentially document incidents with secure evidence upload and location tracking
          </p>
          <button className="feature-button">File Report</button>
        </div>

        {user.role === 'admin' && (
          <div className="feature-card" onClick={() => navigate('/admin')}>
            <div className="feature-icon">⚙️</div>
            <h2 className="feature-title">Command Center</h2>
            <p className="feature-description">
              Monitor active alerts, track responses, and manage safety protocols in real-time
            </p>
            <button className="feature-button admin-button">Access Dashboard</button>
          </div>
        )}
        
        <div className="feature-card glass-card">
          <div className="feature-icon">📞</div>
          <h2 className="feature-title">Emergency Contacts</h2>
          <div className="contacts-display">
            {user.emergencyContacts?.length > 0 ? (
              user.emergencyContacts.map((contact, index) => (
                <div key={index} className="contact-compact">
                  <span className="contact-name">{contact.name}</span>
                  <a href={`tel:${contact.phone}`} className="contact-phone">
                    {contact.phone}
                  </a>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--deep-sea-teal-light)', fontSize: '0.9rem' }}>
                No contacts configured
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Emergency Numbers */}
      <div className="quick-help glass-card" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', maxWidth: '900px', margin: 'var(--space-xl) auto 0' }}>
        <h3 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-md)', fontSize: '1.3rem', fontWeight: 700 }}>
          🚨 Emergency Services
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)' }}>
          <a href="tel:100" className="help-link">🚓 Police: 100</a>
          <a href="tel:1091" className="help-link">👮 Women Helpline: 1091</a>
          <a href="tel:102" className="help-link">🚑 Ambulance: 102</a>
          <a href="tel:181" className="help-link">📞 Women Support: 181</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
