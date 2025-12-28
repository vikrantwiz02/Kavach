import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleContactChange = (index, field, value) => {
    const contacts = [...formData.emergencyContacts];
    contacts[index][field] = value;
    setFormData({ ...formData, emergencyContacts: contacts });
  };

  const addEmergencyContact = () => {
    if (formData.emergencyContacts.length >= 5) {
      setError('Maximum 5 emergency contacts allowed');
      return;
    }
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', relation: '' }]
    });
  };

  const removeContact = (index) => {
    if (formData.emergencyContacts.length === 1) {
      setError('At least one emergency contact is required');
      return;
    }
    const contacts = formData.emergencyContacts.filter((_, i) => i !== index);
    setFormData({ ...formData, emergencyContacts: contacts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate emergency contacts
    const validContacts = formData.emergencyContacts.filter(
      c => c.name && c.phone && c.relation
    );
    
    if (validContacts.length === 0) {
      setError('Please add at least one complete emergency contact');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          emergencyContacts: validContacts
        })
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.user, data.token);
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
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">K</div>
          <h1 className="auth-title">Join Kavach</h1>
          <p className="auth-subtitle">Create your protective shield</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Minimum 6 characters"
              minLength="6"
              required
            />
          </div>

          {/* Emergency Contacts Section */}
          <div className="emergency-contacts-section">
            <div className="emergency-contacts-header">
              <h3 className="emergency-contacts-title">
                🛡️ Emergency Contacts
              </h3>
              <button
                type="button"
                onClick={addEmergencyContact}
                className="add-contact-btn"
              >
                + Add Contact
              </button>
            </div>

            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <div className="form-group">
                  <label className="form-label">Contact Name</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Mom, Friend"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    className="form-input"
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    value={contact.relation}
                    onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Mother, Friend"
                    required
                  />
                </div>

                {formData.emergencyContacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="remove-contact-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
