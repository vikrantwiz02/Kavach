import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🛡️ Kavach</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={onLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-card sos-card" onClick={() => navigate('/sos')}>
            <div className="card-icon">🚨</div>
            <h2>SOS Alert</h2>
            <p>One-tap emergency alert with real-time location sharing</p>
            <button className="btn-primary">Activate SOS</button>
          </div>
          
          <div className="dashboard-card" onClick={() => navigate('/complaint')}>
            <div className="card-icon">📝</div>
            <h2>File Complaint</h2>
            <p>Report incidents with photo evidence and location</p>
            <button className="btn-primary">File Now</button>
          </div>
          
          <div className="dashboard-card" onClick={() => navigate('/fake-call')}>
            <div className="card-icon">📞</div>
            <h2>Fake Call</h2>
            <p>Simulate incoming call to escape uncomfortable situations</p>
            <button className="btn-primary">Start Call</button>
          </div>
          
          {user.role === 'admin' && (
            <div className="dashboard-card admin-card" onClick={() => navigate('/admin')}>
              <div className="card-icon">⚙️</div>
              <h2>Admin Panel</h2>
              <p>Monitor incidents and manage complaints</p>
              <button className="btn-primary">Open Dashboard</button>
            </div>
          )}
        </div>
        
        <div className="info-section">
          <h3>Emergency Contacts</h3>
          <div className="contacts-list">
            {user.emergencyContacts?.length > 0 ? (
              user.emergencyContacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <strong>{contact.name}</strong> ({contact.relation})
                  <br />
                  <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                </div>
              ))
            ) : (
              <p>No emergency contacts added yet.</p>
            )}
          </div>
          
          <div className="quick-links">
            <h3>Quick Help</h3>
            <div className="help-numbers">
              <a href="tel:100" className="help-link">🚓 Police: 100</a>
              <a href="tel:1091" className="help-link">👮 Women Helpline: 1091</a>
              <a href="tel:102" className="help-link">🚑 Ambulance: 102</a>
              <a href="tel:181" className="help-link">📞 Women Helpline: 181</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
