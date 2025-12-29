import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('sos');
  const [socket, setSocket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Socket.IO for real-time updates
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('new-sos-alert', (data) => {
      setSosAlerts(prev => [data, ...prev]);
      playAlertSound();
    });

    newSocket.on('new-complaint', (data) => {
      fetchComplaints();
    });

    newSocket.on('user-location-update', (data) => {
      updateSOSLocation(data);
    });

    fetchStats();
    fetchComplaints();
    fetchSOSAlerts();

    return () => newSocket.disconnect();
  }, []);

  const playAlertSound = () => {
    const audio = new Audio('data:audio/wav;base64,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');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const updateSOSLocation = (data) => {
    setSosAlerts(prev => 
      prev.map(alert => 
        alert.userId === data.userId 
          ? { ...alert, location: data.location }
          : alert
      )
    );
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filterStatus 
        ? `/api/complaints?status=${filterStatus}`
        : '/api/complaints';
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };

  const fetchSOSAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sos/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSosAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch SOS alerts:', error);
    }
  };

  const updateComplaintStatus = async (complaintId, status, priority, adminNotes) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, priority, adminNotes })
      });

      if (response.ok) {
        fetchComplaints();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update complaint:', error);
    }
  };

  const resolveSOSAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sos/${alertId}/resolve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSOSAlerts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to resolve SOS:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [filterStatus]);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
        <h1>Admin Dashboard</h1>
        <span className="admin-badge">Administrator</span>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers || 0}</p>
        </div>
        <div className="stat-card alert">
          <h3>Active SOS Alerts</h3>
          <p className="stat-number">{stats.activeSOSAlerts || 0}</p>
        </div>
        <div className="stat-card warning">
          <h3>Pending Complaints</h3>
          <p className="stat-number">{stats.pendingComplaints || 0}</p>
        </div>
        <div className="stat-card success">
          <h3>Resolved Cases</h3>
          <p className="stat-number">{stats.resolvedComplaints || 0}</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'sos' ? 'active' : ''}`}
          onClick={() => setActiveTab('sos')}
        >
          Active SOS Alerts ({sosAlerts.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          Complaints ({complaints.length})
        </button>
      </div>

      <main className="admin-main">
        {activeTab === 'sos' && (
          <div className="sos-alerts-section">
            {sosAlerts.length === 0 ? (
              <p className="no-data">No active SOS alerts</p>
            ) : (
              <div className="alerts-grid">
                {sosAlerts.map((alert) => (
                  <div key={alert._id} className="alert-card critical">
                    <div className="alert-header">
                      <h3>SOS Alert</h3>
                      <span className="alert-time">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="alert-details">
                      <p><strong>User:</strong> {alert.userId?.name}</p>
                      <p><strong>Phone:</strong> {alert.userId?.phone}</p>
                      <p><strong>Trigger:</strong> {alert.triggerType.toUpperCase()}</p>
                      
                      <div className="location-details">
                        <strong>Location:</strong>
                        <p>Lat: {alert.location.latitude.toFixed(6)}</p>
                        <p>Long: {alert.location.longitude.toFixed(6)}</p>
                        <a 
                          href={`https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-map-small"
                        >
                          View on Map
                        </a>
                      </div>

                      {alert.userId?.emergencyContacts?.length > 0 && (
                        <div className="emergency-contacts-admin">
                          <strong>Emergency Contacts:</strong>
                          {alert.userId.emergencyContacts.map((contact, idx) => (
                            <p key={idx}>
                              {contact.name} ({contact.relation}): {contact.phone}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="btn-resolve"
                      onClick={() => resolveSOSAlert(alert._id)}
                    >
                      ✓ Mark as Resolved
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="complaints-section">
            <div className="filter-bar">
              <label>Filter by Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {complaints.length === 0 ? (
              <p className="no-data">No complaints found</p>
            ) : (
              <div className="complaints-grid">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="complaint-card-admin">
                    <div className="complaint-header-admin">
                      <h3>{complaint.title}</h3>
                      <span className={`status-badge ${complaint.status}`}>
                        {complaint.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="complaint-details">
                      <p><strong>User:</strong> {complaint.userId?.name}</p>
                      <p><strong>Email:</strong> {complaint.userId?.email}</p>
                      <p><strong>Phone:</strong> {complaint.userId?.phone}</p>
                      <p><strong>Category:</strong> {complaint.category.replace('_', ' ').toUpperCase()}</p>
                      <p><strong>Filed:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
                      <p><strong>Description:</strong> {complaint.description}</p>
                      
                      {complaint.images?.length > 0 && (
                        <div className="complaint-images">
                          <strong>Evidence:</strong>
                          <div className="images-grid">
                            {complaint.images.map((img, idx) => (
                              <img key={idx} src={`/${img.path}`} alt="Evidence" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="admin-actions">
                      <select
                        value={complaint.status}
                        onChange={(e) => updateComplaintStatus(complaint._id, e.target.value, complaint.priority, complaint.adminNotes)}
                      >
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      
                      <select
                        value={complaint.priority}
                        onChange={(e) => updateComplaintStatus(complaint._id, complaint.status, e.target.value, complaint.adminNotes)}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <textarea
                      placeholder="Add admin notes..."
                      defaultValue={complaint.adminNotes}
                      onBlur={(e) => updateComplaintStatus(complaint._id, complaint.status, complaint.priority, e.target.value)}
                      className="admin-notes-input"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
