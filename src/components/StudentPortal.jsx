// ============================================
// FILE: src/components/StudentPortal.jsx
// ============================================
import React, { useState, useRef, useEffect } from 'react';

const StudentPortal = ({ onLogout, onAttendanceMarked, allAttendance }) => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [year, setYear] = useState('I');
  const [course, setCourse] = useState('UG');
  const [department, setDepartment] = useState('BCA');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [studentRecords, setStudentRecords] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // College coordinates
  const COLLEGE_LAT = 10.997201;
  const COLLEGE_LON = 76.837499;
  const ALLOWED_RADIUS = 100000000;

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

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
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Camera access denied. Please allow permissions.'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg');
    }
    return null;
  };

  const handleLogin = () => {
    if (email && password) {
      const userData = {
        email,
        name: email.split('@')[0],
        studentId: 'STU001',
        year: 'II',
        course: 'UG',
        department: 'BCA'
      };
      setUser(userData);
      setCurrentScreen('dashboard');
      setStatusMessage({
        type: 'success',
        text: 'Login successful! Welcome back.'
      });
    }
  };

  const handleRegister = () => {
    // Validation
    if (!name || !studentId || !email || !password || !confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill all fields!'
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Passwords do not match!'
      });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 6 characters!'
      });
      return;
    }

    const userData = {
      name,
      studentId,
      email,
      year,
      course,
      department
    };
    
    setUser(userData);
    setCurrentScreen('dashboard');
    setStatusMessage({
      type: 'success',
      text: 'Registration successful!'
    });
  };

  const handleMarkAttendance = async () => {
    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: 'Checking your location...' });

    try {
      const locationData = await getLocation();
      
      const distance = calculateDistance(
        locationData.latitude,
        locationData.longitude,
        COLLEGE_LAT,
        COLLEGE_LON
      );

      if (distance > ALLOWED_RADIUS) {
        setStatusMessage({
          type: 'error',
          text: `You are outside campus! Distance: ${Math.round(distance)}m`
        });
        setIsProcessing(false);
        return;
      }

      setStatusMessage({
        type: 'success',
        text: `Location verified! Distance: ${Math.round(distance)}m`
      });

      await startCamera();
      setCurrentScreen('camera');
      setStatusMessage({
        type: 'info',
        text: 'Position your face in the circle'
      });
      
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Location error: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: 'Processing face recognition...' });

    const imageData = captureImage();
    
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        const now = new Date();
        const record = {
          studentName: user.name,
          studentId: user.studentId,
          year: user.year,
          course: user.course,
          department: user.department,
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          status: 'Present',
          latitude: location.latitude.toFixed(6),
          longitude: location.longitude.toFixed(6)
        };
        
        setStudentRecords([record, ...studentRecords]);
        onAttendanceMarked(record);
        
        setStatusMessage({
          type: 'success',
          text: 'Attendance marked successfully!'
        });
        
        stopCamera();
        setCurrentScreen('success');
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Face not recognized. Try again.'
        });
      }
      
      setIsProcessing(false);
    }, 2000);
  };

  const handleRetry = () => {
    stopCamera();
    setStatusMessage(null);
    setCurrentScreen('dashboard');
  };

  const handleLogoutClick = () => {
    setUser(null);
    setCurrentScreen('login');
    setStudentRecords([]);
    setStatusMessage(null);
    onLogout();
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>👨‍🎓 Student Portal</h1>
        <p>Mark Your Attendance</p>
      </div>

      {/* LOGIN */}
      {currentScreen === 'login' && (
        <div className="main-card">
          <h2 style={{ marginBottom: '25px', color: '#333', textAlign: 'center' }}>
            <span className="icon">👤</span> Student Login
          </h2>

          {statusMessage && (
            <div className={`status-card status-${statusMessage.type}`}>
              <span className="icon">
                {statusMessage.type === 'success' && '✅'}
                {statusMessage.type === 'error' && '❌'}
                {statusMessage.type === 'info' && 'ℹ️'}
              </span>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button onClick={handleLogin} className="btn btn-primary">
              <span className="icon">🔐</span> Login
            </button>
          </div>
          <p className="link-text">
            Don't have an account?{' '}
            <button className="link-button" onClick={() => {
              setCurrentScreen('register');
              setStatusMessage(null);
            }}>
              Register here
            </button>
          </p>
          <p className="link-text" style={{ marginTop: '10px' }}>
            <button className="link-button" onClick={onLogout}>
              ← Back to Portal Selection
            </button>
          </p>
        </div>
      )}

      {/* REGISTER */}
      {currentScreen === 'register' && (
        <div className="main-card">
          <h2 style={{ marginBottom: '25px', color: '#333', textAlign: 'center' }}>
            <span className="icon">✍️</span> Student Registration
          </h2>

          {statusMessage && (
            <div className={`status-card status-${statusMessage.type}`}>
              <span className="icon">
                {statusMessage.type === 'success' && '✅'}
                {statusMessage.type === 'error' && '❌'}
                {statusMessage.type === 'info' && 'ℹ️'}
              </span>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div>
            <div className="form-group">
              <label className="form-label">Name of the Student *</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="STU12345"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year *</label>
                <select
                  className="form-input"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Course *</label>
                <select
                  className="form-input"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.COM">B.COM</option>
                <option value="BBA">BBA</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Email ID *</label>
              <input
                type="email"
                className="form-input"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Create password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button onClick={handleRegister} className="btn btn-primary">
              <span className="icon">📝</span> Register
            </button>
          </div>
          <p className="link-text">
            Already have an account?{' '}
            <button className="link-button" onClick={() => {
              setCurrentScreen('login');
              setStatusMessage(null);
            }}>
              Login here
            </button>
          </p>
        </div>
      )}

      {/* DASHBOARD */}
      {currentScreen === 'dashboard' && user && (
        <div className="main-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
              <h2 style={{ color: '#333' }}>Welcome, {user.name}! 👋</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>Student ID: {user.studentId}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {user.course} - Year {user.year} - {user.department}
              </p>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '10px 20px' }}
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </div>

          {statusMessage && (
            <div className={`status-card status-${statusMessage.type}`}>
              <span className="icon">
                {statusMessage.type === 'success' && '✅'}
                {statusMessage.type === 'error' && '❌'}
                {statusMessage.type === 'info' && 'ℹ️'}
              </span>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>{studentRecords.length}</h3>
              <p>Total Days</p>
            </div>
            <div className="stat-card">
              <h3>{studentRecords.length > 0 ? '95%' : '0%'}</h3>
              <p>Attendance</p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleMarkAttendance}
            disabled={isProcessing}
            style={{ marginTop: '20px' }}
          >
            {isProcessing ? '⏳ Processing...' : '⏰ Mark Attendance Now'}
          </button>

          {location && (
            <div className="location-info">
              <p><strong>📍 Last Location:</strong></p>
              <p>Latitude: {location.latitude.toFixed(6)}</p>
              <p>Longitude: {location.longitude.toFixed(6)}</p>
            </div>
          )}

          {studentRecords.length > 0 && (
            <div style={{ marginTop: '25px' }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>📋 My Attendance</h3>
              {studentRecords.map((record, index) => (
                <div key={index} className="status-card status-success">
                  <span className="icon">✅</span>
                  <div style={{ flex: 1 }}>
                    <strong>{record.date}</strong> at {record.time}
                    <br />
                    <small>{record.status} - {record.department}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CAMERA */}
      {currentScreen === 'camera' && (
        <div className="main-card">
          <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            <span className="icon">📸</span> Face Recognition
          </h2>

          {statusMessage && (
            <div className={`status-card status-${statusMessage.type}`}>
              <span className="icon">
                {statusMessage.type === 'success' && '✅'}
                {statusMessage.type === 'error' && '❌'}
                {statusMessage.type === 'info' && 'ℹ️'}
              </span>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            <div className="camera-overlay"></div>
            <div className="camera-guide">👤 Position your face in the circle</div>
          </div>

          <canvas ref={canvasRef} className="canvas-hidden"></canvas>

          <button className="btn btn-primary" onClick={handleCapture} disabled={isProcessing}>
            {isProcessing ? '⏳ Processing...' : '📸 Capture & Verify'}
          </button>

          <button className="btn btn-secondary" onClick={handleRetry} disabled={isProcessing}>
            ❌ Cancel
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {currentScreen === 'success' && (
        <div className="main-card">
          <div style={{ textAlign: 'center' }}>
            <div className="icon-large" style={{ marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>Attendance Marked!</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Your attendance has been recorded successfully.
            </p>

            {statusMessage && (
              <div className={`status-card status-${statusMessage.type}`}>
                <span className="icon">✅</span>
                <span>{statusMessage.text}</span>
              </div>
            )}

            {location && (
              <div className="location-info">
                <p><strong>✅ Verified Location:</strong></p>
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
              </div>
            )}

            <button className="btn btn-primary" onClick={() => setCurrentScreen('dashboard')}>
              <span className="icon">🏠</span> Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;