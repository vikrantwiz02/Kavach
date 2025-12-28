import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FakeCall = () => {
  const [isRinging, setIsRinging] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerName, setCallerName] = useState('Mom');
  const [customName, setCustomName] = useState('');
  const [delay, setDelay] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startFakeCall = () => {
    setTimeout(() => {
      setIsRinging(true);
      playRingtone();
      
      // Trigger browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Incoming Call', {
          body: `${callerName} is calling...`,
          icon: '/phone-icon.png',
          vibrate: [200, 100, 200]
        });
      }
    }, delay * 1000);
  };

  const playRingtone = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwPUajk77pjHAU7k9n0yX0qBSh+zPHaizsKGGS66+mmVRILSKDi8bllHgcthM/z3IY2Bhxqvu7mnEwLD1Cn4++6Yx4FPJTb9cp8KwYofsrw2Yo6ChljuuvqplUSCkef4fG6ZRwFLIPO8tmJNggaaLvt559NEAxPqOPwtmMcBjiS1vPKfiwGKH3K8diKOwoYY7rr6qZVEQpHnuHxumUcBSyCzvLZiTYIG2m97+aeSwwPT6fj8LdjHQU6k9f0yn0rBih9yvLYijsKGGO66+qmVRIKR5/h8bplHAUsg87y2Yk2CBlpve/nnkwLD0+o4/C3Yx0FOZPa9Ml9KwYofsrx2Io6ChljuuvqplUSCkef4fG6ZR4FLIPOut2JNggZaLvt559NEAxPqOPwtmMcBjiS1vPKfiwGJ33M8diKOwoYY7rr6qZVEQpHn+DxumUcBSyCzvLZiTcIG2m77+aeSwwPT6jj8LdjHQU5lNn0yX0rBih9yvLYijsKGGO66+qmVRIKR57h8bplHAUsg87y2Yk2CBlpve/nnkwLD0+o4/C3Yx0FOZPa9Ml9KwYofsrx2Io6ChljuuvqplUSCkef4fG6ZR4FLIPOut2JNggZaLvt559NEAxPqOPwtmMcBjiS1vPKfiwGJ33M8diKOwoYY7rr6qZVEQpHn+DxumUcBSyCzvLZiTcIG2m77+aeSwwPT6jj8LdjHQU5lNn0yX0rBih9yvLYijsKGGO66+qmVRIKR57h8bplHAUsg87y2Yk2CBlpve/nnkwLD0+o4/C3Yx0FOZPa9Ml9KwYofsrx2Io6ChljuuvqplUSCkef4fG6ZR4FLIPOut2JNggZaLvt559MEAxPqOPwtmMcBjiS1vPKfiwGJ33M8diKOwoYY7rr6qZVEQpHn+DxumUcBSyCzvLZiTcIG2m77+aeSwwPT6jj8LdjHQU5lNn0yX0rBih9yvLYijsKGGO66+qmVRIKR57h8bplHAUsg87y2Yk2CBlpve/nnkwLD0+o4/C3Yx0FOZPa9Ml9KwYofsrx2Io6ChljuuvqplUSCkef4fG6ZR4FLIPOut2JNggZaLvt559NEAxPqOPwtmMcBjiS1vPKfiwGJ33M8diKOwoYY7rr6qZVEQpHn+DxumUcBSyCzvLZiTcIG2m77+aeSwwPT6jj8LdjHQU5lNn0yX0rBih9yvLYijsKGGO66+qmVRIKR57h8bplHAUsgs7y2Yk2CBlpve/nnkwLD0+o4/C3Yx0FOZPa9Ml9KwYofsrx2Io6ChljuuvqplUSCkef4fG6ZR4FLIPOut2JNggZaLvt559NEAxPqOPwtmMcBjiS1vPKfiwGJ33M8diKOwoYY7rr6qZVEQpHn+DxumUcBSyCzvLZiTcIG2m77+aeSwwPT6jj8LdjHQU5lNn0yX0rBih9yvLYijsKGGO66+qmVRIKR57h8bplHAUsgs7y2Yk2CBlpve/nnkwLD0+o4/C3Yx0FOZPa9Ml9KwYofsrx2Io6ChljuuvqplUSCkef4fG6ZR4FLIPOut2JNggZaLvt559NEAxPqOPwtmMcBjiS1vPKfiwGJ33M8diKOwoYY7rr6qZVEQpHn+DxumUcBSyCzvLZiTcIG2m77+aeSwwPT6jj8LdjHQU=');
    audio.loop = true;
    audio.play().catch(e => console.log('Ringtone play failed:', e));
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
      const vibrateInterval = setInterval(() => {
        navigator.vibrate([500, 200, 500]);
      }, 1000);
      
      setTimeout(() => clearInterval(vibrateInterval), 10000);
    }
  };

  const answerCall = () => {
    setIsRinging(false);
    setIsInCall(true);
    setCallDuration(0);
  };

  const endCall = () => {
    setIsRinging(false);
    setIsInCall(false);
    setCallDuration(0);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const presetCallers = [
    { name: 'Mom', emoji: '👩' },
    { name: 'Dad', emoji: '👨' },
    { name: 'Boss', emoji: '💼' },
    { name: 'Doctor', emoji: '⚕️' },
    { name: 'Friend', emoji: '👯' },
  ];

  return (
    <div className="fake-call-container">
      <header className="fake-call-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">← Back</button>
        <h1>📞 Fake Call Simulator</h1>
      </header>

      {!isRinging && !isInCall ? (
        <main className="fake-call-setup">
          <div className="setup-card">
            <h2>Setup Fake Call</h2>
            <p className="description">
              Receive a fake call to help you escape uncomfortable or unsafe situations.
            </p>

            <div className="form-group">
              <label>Choose Caller:</label>
              <div className="caller-presets">
                {presetCallers.map((caller) => (
                  <button
                    key={caller.name}
                    className={`preset-btn ${callerName === caller.name ? 'active' : ''}`}
                    onClick={() => setCallerName(caller.name)}
                  >
                    {caller.emoji} {caller.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Or Enter Custom Name:</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  if (e.target.value) setCallerName(e.target.value);
                }}
                placeholder="Enter caller name"
              />
            </div>

            <div className="form-group">
              <label>Call Delay: {delay} seconds</label>
              <input
                type="range"
                min="5"
                max="60"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="slider"
              />
            </div>

            <button 
              className="btn-start-call"
              onClick={() => {
                requestNotificationPermission();
                startFakeCall();
              }}
            >
              Start Fake Call in {delay}s
            </button>

            <div className="info-box">
              <h3>How it works:</h3>
              <ul>
                <li>✓ Choose who's "calling" you</li>
                <li>✓ Set a delay before the call comes in</li>
                <li>✓ Your phone will ring with notifications</li>
                <li>✓ Answer to start a realistic fake conversation</li>
                <li>✓ Use this to politely exit uncomfortable situations</li>
              </ul>
            </div>
          </div>
        </main>
      ) : isRinging ? (
        <div className="incoming-call">
          <div className="call-screen">
            <div className="caller-info">
              <div className="caller-avatar">
                {presetCallers.find(c => c.name === callerName)?.emoji || '📞'}
              </div>
              <h2>{callerName}</h2>
              <p>Incoming call...</p>
            </div>

            <div className="call-actions">
              <button className="btn-decline" onClick={endCall}>
                📵 Decline
              </button>
              <button className="btn-answer" onClick={answerCall}>
                📞 Answer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="active-call">
          <div className="call-screen">
            <div className="caller-info">
              <div className="caller-avatar">
                {presetCallers.find(c => c.name === callerName)?.emoji || '📞'}
              </div>
              <h2>{callerName}</h2>
              <p className="call-duration">{formatTime(callDuration)}</p>
            </div>

            <div className="call-suggestions">
              <p><strong>Suggested responses:</strong></p>
              <ul>
                <li>"Yes, I'll be right there."</li>
                <li>"Is everything okay?"</li>
                <li>"I'm on my way home now."</li>
                <li>"I'll leave right away."</li>
              </ul>
            </div>

            <button className="btn-end-call" onClick={endCall}>
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FakeCall;
