import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s-]/g, ''));

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
    setError('');
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

    // Client-side validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate emergency contacts
    const validContacts = formData.emergencyContacts.filter(
      c => c.name.trim() && c.phone.trim() && c.relation.trim()
    );
    
    if (validContacts.length === 0) {
      setError('Please add at least one complete emergency contact');
      return;
    }

    // Validate emergency contact phone numbers
    const invalidContact = validContacts.find(c => !isValidPhone(c.phone));
    if (invalidContact) {
      setError('Please enter valid phone numbers for emergency contacts');
      return;
    }

    setLoading(true);

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
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2>Join Kavach</h2>
        <p>Create your protective shield</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength="6"
              required
            />
          </div>

          {/* Emergency Contacts Section */}
          <div className="emergency-contacts-section">
            <h3>Emergency Contacts</h3>

            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="emergency-contact-item">
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    placeholder="e.g., Mom, Friend"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    value={contact.relation}
                    onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
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
            
            <button
              type="button"
              onClick={addEmergencyContact}
              className="add-contact-btn"
            >
              + Add Another Contact
            </button>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{' '}
          <Link to="/login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
