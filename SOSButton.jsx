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
      setStatus('📍 Getting your location...');
      locationData = await getCurrentLocation();
      setStatus('🚨 Sending SOS alert with location...');
    } catch (error) {
      console.warn('Location unavailable, proceeding without it:', error);
      setStatus('🚨 Sending SOS alert (location unavailable)...');
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
      setStatus('✅ SOS Active - Location broadcasting every 30 seconds');
    } else {
      setStatus('✅ SOS Active - Emergency contacts notified (location unavailable)');
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
      setStatus('✅ SOS Alert sent successfully! Emergency contacts notified.');
    });

    newSocket.on('sos-error', (data) => {
      setStatus('❌ Failed to send SOS alert. Please try again.');
      setIsActive(false);
    });

    // Request location permission on page load
    if (navigator.geolocation) {
      setStatus('📍 Requesting location access...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(locationData);
          setStatus('✅ Location access ready!');
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
              setStatus('✅ Location access ready (approximate)');
            },
            (retryError) => {
              console.error('Location retry failed:', retryError);
              setStatus('⚠️ Location unavailable. You can still use SOS but location won\'t be shared.');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setStatus('❌ Geolocation not supported by your browser');
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
        console.log('🎤 Voice detected:', transcript);
        
        // Trigger SOS on specific phrases
        if (transcript.includes('help') || transcript.includes('emergency') || 
            transcript.includes('sos') || transcript.includes('danger')) {
          console.log('🚨 SOS trigger word detected!');
          setStatus('🎤 Voice command "' + transcript + '" detected! Activating SOS...');
          // Use ref to call the latest version of activateSOS
          if (activateSOSRef.current) {
            activateSOSRef.current('voice');
          }
        } else {
          console.log('Not a trigger word, still listening...');
        }
      };

      recognitionRef.current.onstart = () => {
        console.log('🎤 Voice recognition started');
        setStatus('🎤 Listening for "help", "emergency", "SOS", or "danger"...');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setStatus('❌ Microphone access denied. Please enable in browser settings.');
          setListening(false);
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
        } else if (event.error === 'aborted') {
          console.log('Recognition aborted');
        } else {
          setStatus('⚠️ Voice recognition error: ' + event.error);
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

      // Try with high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(locationData);
          resolve(locationData);
        },
        (error) => {
          console.error('High accuracy location failed:', error.code, error.message);
          // Fallback: Try with lower accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              };
              setLocation(locationData);
              resolve(locationData);
            },
            (retryError) => {
              let errorMessage = 'Failed to get location. ';
              switch(retryError.code) {
                case retryError.PERMISSION_DENIED:
                  errorMessage += 'Please allow location access in your browser settings.';
                  break;
                case retryError.POSITION_UNAVAILABLE:
                  errorMessage += 'Try moving to a window or enabling WiFi/GPS on your device.';
                  break;
                case retryError.TIMEOUT:
                  errorMessage += 'Location request timed out. Try again.';
                  break;
                default:
                  errorMessage += 'Unknown error occurred.';
              }
              reject(new Error(errorMessage));
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
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
      setStatus('❌ Voice recognition not supported in your browser. Use Chrome or Edge.');
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
        setStatus('🎤 Voice activation enabled - Say "help", "emergency", or "SOS"');
      } catch (e) {
        console.error('Error starting recognition:', e);
        setStatus('❌ Could not start voice recognition. Check microphone permissions.');
      }
    }
  };

  const requestLocationPermission = async () => {
    try {
      setStatus('📍 Requesting location permission...');
      await getCurrentLocation();
      setStatus('✅ Location access granted!');
    } catch (error) {
      setStatus(`❌ ${error.message}`);
    }
  };

  return (
    <div className="sos-container">
      <header className="sos-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
        <h1>🚨 SOS Emergency</h1>
      </header>

      <main className="sos-main">
        <div className="sos-status">
          {status && <p className={`status-message ${isActive ? 'active' : ''}`}>{status}</p>}
          
          {!location && !isActive && (
            <button onClick={requestLocationPermission} className="btn-location-test">
              📍 Test Location Access
            </button>
          )}
          
          {location && (
            <div className="location-info">
              <h3>📍 Current Location</h3>
              <p>Latitude: {location.latitude.toFixed(6)}</p>
              <p>Longitude: {location.longitude.toFixed(6)}</p>
              <p>Accuracy: ±{location.accuracy.toFixed(0)}m</p>
              <a 
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-map"
              >
                View on Map
              </a>
            </div>
          )}
        </div>

        <div className="sos-controls">
          {!isActive ? (
            <button 
              className="sos-button"
              onClick={() => activateSOS('button')}
            >
              <div className="sos-button-inner">
                <span className="sos-icon">🚨</span>
                <span className="sos-text">PRESS FOR SOS</span>
              </div>
            </button>
          ) : (
            <button 
              className="sos-button active"
              onClick={deactivateSOS}
            >
              <div className="sos-button-inner">
                <span className="sos-icon">✓</span>
                <span className="sos-text">SOS ACTIVE</span>
                <span className="sos-subtext">Tap to Stop</span>
              </div>
            </button>
          )}

          <button 
            className={`voice-button ${listening ? 'active' : ''}`}
            onClick={toggleVoiceActivation}
          >
            {listening ? '🎤 Voice Active' : '🎤 Enable Voice SOS'}
          </button>
        </div>

          <div className="sos-info">
          <h3>How it works:</h3>
          <ul>
            <li>✓ One-tap SOS sends alert to emergency contacts immediately</li>
            <li>✓ Location shared automatically if available</li>
            <li>✓ Works even if location is unavailable</li>
            <li>✓ Admins are immediately notified on their dashboard</li>
            <li>✓ Voice activation: Say "help", "emergency", or "SOS"</li>
            <li>✓ Your emergency contacts will be notified via SMS/Call</li>
          </ul>
          <div className="location-troubleshooting">
            <p><strong>⚠️ Location not working?</strong></p>
            <p>• Enable WiFi (even without connecting)</p>
            <p>• Check System Settings → Privacy & Security → Location Services</p>
            <p>• Make sure your browser has location permission</p>
            <p>• Move near a window or outdoors</p>
            <p>• SOS still works without location!</p>
          </div>
        </div>        <div className="emergency-actions">
          <h3>Quick Actions:</h3>
          <div className="action-buttons">
            <a href="tel:100" className="emergency-btn">📞 Call Police (100)</a>
            <a href="tel:1091" className="emergency-btn">📞 Women Helpline (1091)</a>
            <a href="tel:102" className="emergency-btn">📞 Ambulance (102)</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SOSButton;
