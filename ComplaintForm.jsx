import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ComplaintForm = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'harassment'
  });
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyComplaints();
    getCurrentLocation();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      
      if (location) {
        formDataToSend.append('location', JSON.stringify(location));
      }
      
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ title: '', description: '', category: 'harassment' });
        setImages([]);
        fetchMyComplaints();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to file complaint');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: '🟡 Pending',
      investigating: '🔵 Investigating',
      resolved: '🟢 Resolved',
      closed: '⚫ Closed'
    };
    return badges[status] || status;
  };

  return (
    <div className="complaint-container">
      <header className="complaint-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
        <h1>📝 File Complaint</h1>
      </header>

      <main className="complaint-main">
        <div className="complaint-form-section">
          <form onSubmit={handleSubmit} className="complaint-form">
            {success && (
              <div className="success-message">
                ✅ Complaint filed successfully! You'll be notified of any updates.
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Complaint Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Brief description of the incident"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="harassment">Harassment</option>
                <option value="stalking">Stalking</option>
                <option value="assault">Assault</option>
                <option value="domestic_violence">Domestic Violence</option>
                <option value="cyber_crime">Cyber Crime</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Please provide as much detail as possible about the incident..."
              />
            </div>

            <div className="form-group">
              <label>Upload Images (Max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={images.length >= 5}
              />
              <small>Accepted formats: JPG, PNG, GIF (Max 5MB per image)</small>
            </div>

            {images.length > 0 && (
              <div className="image-preview">
                {images.map((image, index) => (
                  <div key={index} className="preview-item">
                    <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                    <button type="button" onClick={() => removeImage(index)} className="remove-btn">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {location && (
              <div className="location-display">
                <strong>📍 Location captured:</strong> 
                <span>Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <div className="my-complaints-section">
          <h2>My Complaints</h2>
          {myComplaints.length === 0 ? (
            <p className="no-complaints">No complaints filed yet.</p>
          ) : (
            <div className="complaints-list">
              {myComplaints.map((complaint) => (
                <div key={complaint._id} className="complaint-card">
                  <div className="complaint-header-card">
                    <h3>{complaint.title}</h3>
                    <span className="status-badge">{getStatusBadge(complaint.status)}</span>
                  </div>
                  <p className="complaint-category">{complaint.category.replace('_', ' ').toUpperCase()}</p>
                  <p className="complaint-description">{complaint.description}</p>
                  <div className="complaint-meta">
                    <small>Filed: {new Date(complaint.createdAt).toLocaleDateString()}</small>
                    {complaint.adminNotes && (
                      <div className="admin-notes">
                        <strong>Admin Notes:</strong> {complaint.adminNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComplaintForm;
