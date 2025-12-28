import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ComplaintForm = ({ user }) => {
  const [step, setStep] = useState(1);
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
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error)
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
        setStep(1);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="complaint-container">
      <button onClick={() => navigate('/dashboard')} className="back-button">
        ← Dashboard
      </button>

      <div className="complaint-wizard">
        {/* Wizard Progress */}
        <div className="wizard-progress">
          <div className="wizard-steps">
            <div className={`wizard-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
              <div className="step-label">Incident Details</div>
            </div>
            <div className={`wizard-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{step > 2 ? '✓' : '2'}</div>
              <div className="step-label">Evidence</div>
            </div>
            <div className={`wizard-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <div className="step-circle">{step > 3 ? '✓' : '3'}</div>
              <div className="step-label">Review</div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        {success ? (
          <div className="complaint-form-card">
            <div className="success-message" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>✓</div>
              <h2 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-sm)', fontSize: '1.8rem' }}>
                Report Submitted Successfully
              </h2>
              <p style={{ color: 'var(--deep-sea-teal-light)', fontSize: '1rem' }}>
                Your complaint has been securely recorded. Our team will review it shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="complaint-form-card">
            {/* Step 1: Incident Details */}
            {step === 1 && (
              <div style={{ animation: 'floatIn 0.6s ease' }}>
                <h2 className="complaint-form-title">Incident Details</h2>
                <p className="complaint-form-subtitle">
                  Please provide a clear description of what happened. Your information will be handled confidentially.
                </p>

                {error && <div className="error-message">{error}</div>}

                <div className="form-section">
                  <label className="form-label">Incident Type</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="harassment">Harassment</option>
                    <option value="assault">Assault</option>
                    <option value="stalking">Stalking</option>
                    <option value="domestic">Domestic Violence</option>
                    <option value="cyber">Cyber Crime</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-section">
                  <label className="form-label">Brief Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Summarize the incident in a few words"
                    required
                  />
                </div>

                <div className="form-section">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Please describe what happened, when it occurred, and any other relevant details..."
                    required
                  />
                </div>

                {location && (
                  <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--deep-sea-teal-transparent)',
                    borderRadius: 'var(--radius-organic-sm)',
                    marginTop: 'var(--space-md)',
                    fontSize: '0.9rem',
                    color: 'var(--deep-sea-teal)'
                  }}>
                    ✓ Location automatically captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="submit-complaint-btn"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Evidence Upload */}
            {step === 2 && (
              <div style={{ animation: 'floatIn 0.6s ease' }}>
                <h2 className="complaint-form-title">Supporting Evidence</h2>
                <p className="complaint-form-subtitle">
                  Upload photos or documents that support your report (optional but recommended).
                </p>

                {error && <div className="error-message">{error}</div>}

                <div className="form-section">
                  <label className="form-label">Upload Images (Max 5)</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                    <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                      <div className="file-upload-icon">📁</div>
                      <div className="file-upload-text">Click or drag to upload</div>
                      <div className="file-upload-hint">PNG, JPG up to 10MB each</div>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="image-preview">
                      {images.map((image, index) => (
                        <div key={index} className="preview-item">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="preview-image"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="preview-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="submit-complaint-btn"
                    style={{
                      background: 'var(--glass-background)',
                      color: 'var(--deep-sea-teal)',
                      border: '2px solid var(--deep-sea-teal)'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="submit-complaint-btn"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div style={{ animation: 'floatIn 0.6s ease' }}>
                <h2 className="complaint-form-title">Review Your Report</h2>
                <p className="complaint-form-subtitle">
                  Please verify all information before submitting. Your report will be handled with complete confidentiality.
                </p>

                {error && <div className="error-message">{error}</div>}

                <div style={{
                  background: 'var(--glass-background)',
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--radius-organic-md)',
                  border: '2px solid var(--glass-border)',
                  marginBottom: 'var(--space-lg)'
                }}>
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h4 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>
                      Type
                    </h4>
                    <p style={{ color: 'var(--deep-sea-teal-light)', fontSize: '1rem', fontWeight: 600 }}>
                      {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                    </p>
                  </div>

                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h4 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>
                      Title
                    </h4>
                    <p style={{ color: 'var(--deep-sea-teal-light)', fontSize: '1rem', fontWeight: 600 }}>
                      {formData.title}
                    </p>
                  </div>

                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <h4 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>
                      Description
                    </h4>
                    <p style={{ color: 'var(--deep-sea-teal-light)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {formData.description}
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-sm)', fontSize: '0.9rem' }}>
                        Evidence ({images.length} {images.length === 1 ? 'file' : 'files'})
                      </h4>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        {images.map((_, index) => (
                          <div
                            key={index}
                            style={{
                              width: '60px',
                              height: '60px',
                              background: 'var(--soft-clay-coral-transparent)',
                              borderRadius: 'var(--radius-organic-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem'
                            }}
                          >
                            📷
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {location && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <h4 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-xs)', fontSize: '0.9rem' }}>
                        Location
                      </h4>
                      <p style={{ color: 'var(--deep-sea-teal-light)', fontSize: '0.9rem' }}>
                        ✓ Coordinates attached
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="submit-complaint-btn"
                    style={{
                      background: 'var(--glass-background)',
                      color: 'var(--deep-sea-teal)',
                      border: '2px solid var(--deep-sea-teal)'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-complaint-btn"
                    style={{
                      background: loading 
                        ? 'var(--gray-400)' 
                        : 'linear-gradient(135deg, var(--soft-clay-coral), var(--soft-clay-coral-light))'
                    }}
                  >
                    {loading ? 'Submitting...' : '✓ Submit Report'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ComplaintForm;
