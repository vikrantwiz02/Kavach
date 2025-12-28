import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    emergencyContacts: [{ name: '', phone: '', relation: '' }]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (index, field, value) => {
    const contacts = [...formData.emergencyContacts];
    contacts[index][field] = value;
    setFormData({ ...formData, emergencyContacts: contacts });
  };

  const addEmergencyContact = () => {
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', relation: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || data.errors?.[0]?.msg || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="logo">
          <h1>🛡️ Kavach</h1>
          <p>Women's Safety Platform</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Register</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="At least 6 characters"
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="emergency-contacts">
            <h3>Emergency Contacts</h3>
            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="contact-group">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Relation"
                  value={contact.relation}
                  onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                />
              </div>
            ))}
            <button type="button" onClick={addEmergencyContact} className="btn-secondary">
              + Add Contact
            </button>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
