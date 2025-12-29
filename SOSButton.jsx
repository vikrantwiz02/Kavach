import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const SOSButton = ({ user }) => {
  const [location, setLocation] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('');
  const [listening, setListening] = useState(false);
  const [socket, setSocket] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const activateSOSRef = useRef(null);

  const activateSOS = async (triggerType = 'button') => {
    setIsActive(true);
    
    let locationData = null;
    
    try {
      setStatus('Getting your location...');
      locationData = await getCurrentLocation();
      setStatus('Sending SOS alert with location...');
    } catch (error) {
      console.warn('Location unavailable, proceeding without it:', error);
      setStatus('Sending SOS alert (location unavailable)...');
    }

    // Send SOS via Socket.IO (with or without location)
    if (socket) {
      socket.emit('sos-alert', {
        userId: user.id,
        userName: user.name,
        location: locationData || { error: 'Location unavailable' },
        triggerType,
        timestamp: new Date().toISOString()
      });
    }

    // Try to start continuous location tracking
    if (locationData) {
      startLocationTracking();
      setStatus('SOS Active - Location broadcasting every 30 seconds');
    } else {
      setStatus('SOS Active - Emergency contacts notified (location unavailable)');
    }
  };

  // Store reference for use in callbacks
  activateSOSRef.current = activateSOS;

  useEffect(() => {
    // Initialize Socket.IO
    const newSocket = io(window.location.origin);
    setSocket(newSocket);
    
    newSocket.emit('user-online', user.id);

    newSocket.on('sos-confirmed', (data) => {
      setStatus('SOS Alert sent successfully! Emergency contacts notified.');
    });

    newSocket.on('sos-error', (data) => {
      setStatus('Failed to send SOS alert. Please try again.');
      setIsActive(false);
    });

    // Request location permission on page load
    if (navigator.geolocation) {
      setStatus('Requesting location access...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(locationData);
          setStatus('Location access ready!');
        },
        (error) => {
          console.log('Initial location error:', error.code, error.message);
          // Try again with lower accuracy requirements
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              };
              setLocation(locationData);
              setStatus('Location access ready (approximate)');
            },
            (retryError) => {
              console.error('Location retry failed:', retryError);
              setStatus('Location unavailable. You can still use SOS but location won\'t be shared.');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setStatus('Geolocation not supported by your browser');
    }

    // Initialize Web Speech API for voice activation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('Voice detected:', transcript);
        
        // Trigger SOS on specific phrases
        if (transcript.includes('help') || transcript.includes('emergency') || 
            transcript.includes('sos') || transcript.includes('danger')) {
          console.log('SOS trigger word detected!');
          setStatus('Voice command "' + transcript + '" detected! Activating SOS...');
          // Use ref to call the latest version of activateSOS
          if (activateSOSRef.current) {
            activateSOSRef.current('voice');
          }
        } else {
          console.log('Not a trigger word, still listening...');
        }
      };

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
        setStatus('Listening for "help", "emergency", "SOS", or "danger"...');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setStatus('Microphone access denied. Please enable in browser settings.');
          setListening(false);
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
        } else if (event.error === 'aborted') {
          console.log('Recognition aborted');
        } else {
          setStatus('Voice recognition error: ' + event.error);
        }
      };

      recognitionRef.current.onend = () => {
        // Restart if still supposed to be listening
        if (listening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Recognition restart error:', e);
          }
        }
      };
    }

    return () => {
      newSocket.disconnect();
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (recognitionRef.current && listening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      };

      const fallbackOptions = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      };

      const handleSuccess = (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(locationData);
        resolve(locationData);
      };

      const handleError = (error) => {
        const errorMessages = {
          [error.PERMISSION_DENIED]: 'Please allow location access in your browser settings.',
          [error.POSITION_UNAVAILABLE]: 'Try moving to a window or enabling WiFi/GPS on your device.',
          [error.TIMEOUT]: 'Location request timed out. Try again.'
        };
        const message = errorMessages[error.code] || 'Unknown error occurred.';
        reject(new Error(`Failed to get location. ${message}`));
      };

      // Try high accuracy first, fallback to low accuracy on error
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        () => navigator.geolocation.getCurrentPosition(handleSuccess, handleError, fallbackOptions),
        options
      );
    });
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(locationData);
        
        // Broadcast location update via Socket.IO
        if (socket && isActive) {
          socket.emit('location-update', {
            userId: user.id,
            location: locationData
          });
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    );

    setWatchId(id);
  };

  const deactivateSOS = () => {
    setIsActive(false);
    setStatus('SOS deactivated');
    
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const toggleVoiceActivation = () => {
    if (!recognitionRef.current) {
      setStatus('Voice recognition not supported in your browser. Use Chrome or Edge.');
      return;
    }

    if (listening) {
      try {
        recognitionRef.current.stop();
        setListening(false);
        setStatus('Voice activation disabled');
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
        setStatus('Voice activation enabled - Say "help", "emergency", or "SOS"');
      } catch (e) {
        console.error('Error starting recognition:', e);
        setStatus('Could not start voice recognition. Check microphone permissions.');
      }
    }
  };

  const requestLocationPermission = async () => {
    try {
      setStatus('Requesting location permission...');
      await getCurrentLocation();
      setStatus('Location access granted!');
    } catch (error) {
      setStatus(`${error.message}`);
    }
  };

  return (
    <div className={`sos-container ${isActive ? 'emergency' : ''}`}>
      <button onClick={() => navigate('/dashboard')} className="back-button">
        ← Dashboard
      </button>

      <div className="sos-header">
        <h1 className="sos-title">Emergency Protocol</h1>
        <p className="sos-subtitle">
          {isActive ? 'Alert Active - Help is being notified' : 'Tap the core to activate instant protection'}
        </p>
      </div>

      <div className="sos-main">
        {/* Breathing Liquid Core SOS Button */}
        <div className="sos-button-wrapper">
          <button 
            className={`sos-button ${isActive ? 'active' : ''}`}
            onClick={isActive ? deactivateSOS : () => activateSOS('button')}
          >
            <span className="sos-button-icon">
              {isActive ? '✓' : '!'}
            </span>
            <span className="sos-button-text">
              {isActive ? 'ACTIVE' : 'SOS'}
            </span>
          </button>
        </div>

        {/* Controls Panel */}
        <div className="sos-controls">
          <div 
            className="voice-toggle"
            onClick={toggleVoiceActivation}
          >
            <div className="voice-toggle-label">
              <span>♪</span>
              <span>Voice Activation</span>
            </div>
            <div className={`voice-toggle-switch ${listening ? 'active' : ''}`} />
          </div>

          {status && (
            <div className={`sos-status ${isActive ? 'emergency' : ''}`}>
              {status}
            </div>
          )}

          {!location && !isActive && (
            <button 
              onClick={requestLocationPermission}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                background: 'var(--soft-clay-coral-transparent)',
                border: '2px solid var(--soft-clay-coral)',
                borderRadius: 'var(--radius-organic-sm)',
                color: 'var(--soft-clay-coral-dark)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Test Location Access
            </button>
          )}

          {location && (
            <div style={{
              padding: 'var(--space-md)',
              background: 'var(--deep-sea-teal-transparent)',
              borderRadius: 'var(--radius-organic-sm)',
              border: '2px solid var(--deep-sea-teal-glass)',
              marginTop: 'var(--space-md)'
            }}>
              <h4 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-sm)', fontWeight: 700 }}>
                Location Acquired
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--deep-sea-teal-light)', marginBottom: '0.25rem' }}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--deep-sea-teal-light)', marginBottom: 'var(--space-sm)' }}>
                Accuracy: ±{location.accuracy.toFixed(0)}m
              </p>
              <a 
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'var(--deep-sea-teal)',
                  color: 'var(--ice-white)',
                  borderRadius: 'var(--radius-organic-sm)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                View on Map →
              </a>
            </div>
          )}
        </div>

        {/* Quick Emergency Numbers */}
        <div className="glass-card" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)' }}>
          <h3 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-md)', fontSize: '1.2rem', fontWeight: 700 }}>
            Direct Emergency Lines
          </h3>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            <a href="tel:100" className="help-link">Police: 100</a>
            <a href="tel:1091" className="help-link">Women Helpline: 1091</a>
            <a href="tel:102" className="help-link">Ambulance: 102</a>
          </div>
        </div>

        {/* Information Panel */}
        <div className="glass-card" style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)' }}>
          <h3 style={{ color: 'var(--deep-sea-teal)', marginBottom: 'var(--space-md)', fontSize: '1.1rem', fontWeight: 700 }}>
            How Protection Works
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            color: 'var(--deep-sea-teal-light)', 
            fontSize: '0.9rem',
            lineHeight: '1.8'
          }}>
            <li>✓ Instant alert to all emergency contacts</li>
            <li>✓ Real-time location sharing when available</li>
            <li>✓ SMS notifications sent automatically</li>
            <li>✓ Admin dashboard receives immediate notification</li>
            <li>✓ Voice commands: "help", "emergency", "SOS", "danger"</li>
            <li>✓ Works even without location access</li>
          </ul>

          <div style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'var(--soft-clay-coral-transparent)',
            borderRadius: 'var(--radius-organic-sm)',
            borderLeft: '4px solid var(--soft-clay-coral)'
          }}>
            <p style={{ fontWeight: 600, color: 'var(--soft-clay-coral-dark)', marginBottom: 'var(--space-xs)' }}>
              Location Troubleshooting
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--deep-sea-teal)', lineHeight: '1.6' }}>
              Enable WiFi • Check browser permissions • Move near window • System Settings → Privacy → Location Services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSButton;
