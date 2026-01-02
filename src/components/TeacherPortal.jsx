// ============================================
// FILE: src/components/TeacherPortal.jsx
// ============================================
import React, { useState } from 'react';

const TeacherPortal = ({ onLogout, attendanceData }) => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [teacher, setTeacher] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [department, setDepartment] = useState('BCA');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [statusMessage, setStatusMessage] = useState(null);

  const handleLogin = () => {
    if (email && password) {
      setTeacher({
        email,
        name: email.split('@')[0],
        teacherId: 'TCH001',
        department: 'BCA'
      });
      setCurrentScreen('dashboard');
      setStatusMessage({
        type: 'success',
        text: 'Login successful! Welcome.'
      });
    }
  };

  const handleRegister = () => {
    // Validation
    if (!name || !teacherId || !email || !password || !confirmPassword) {
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

    setTeacher({
      name,
      teacherId,
      email,
      department
    });
    setCurrentScreen('dashboard');
    setStatusMessage({
      type: 'success',
      text: 'Registration successful!'
    });
  };

  const handleLogoutClick = () => {
    setTeacher(null);
    setCurrentScreen('login');
    setStatusMessage(null);
    onLogout();
  };

  // Filter attendance data by teacher's department
  const departmentStudents = teacher 
    ? attendanceData.filter(record => record.department === teacher.department)
    : [];

  // Apply additional filters
  const filteredData = departmentStudents.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate === '' || record.date === new Date(filterDate).toLocaleDateString();
    
    const matchesDept = filterDepartment === 'All' || record.department === filterDepartment;
    
    return matchesSearch && matchesDate && matchesDept;
  });

  // Get statistics for teacher's department
  const totalRecords = departmentStudents.length;
  const uniqueStudents = [...new Set(departmentStudents.map(r => r.studentId))].length;
  const todayRecords = departmentStudents.filter(r => r.date === new Date().toLocaleDateString()).length;

  return (
    <div className="app-container">
      <div className="header">
        <h1>👨‍🏫 Teacher Portal</h1>
        <p>View Student Attendance</p>
      </div>

      {/* LOGIN */}
      {currentScreen === 'login' && (
        <div className="main-card">
          <h2 style={{ marginBottom: '25px', color: '#333', textAlign: 'center' }}>
            <span className="icon">👨‍🏫</span> Teacher Login
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
                placeholder="teacher@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
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
            <span className="icon">✍️</span> Teacher Registration
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
              <label className="form-label">Name of the Teacher *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Dr. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teacher ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="TCH12345"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              />
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
                placeholder="teacher@college.edu"
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
      {currentScreen === 'dashboard' && teacher && (
        <div className="main-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
              <h2 style={{ color: '#333' }}>Welcome, {teacher.name}! 👋</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                {teacher.department} Department Teacher
              </p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Teacher ID: {teacher.teacherId}
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

          {/* Department Info Banner */}
          <div className="department-banner">
            <h3 style={{ margin: 0, color: '#667eea' }}>
              📚 {teacher.department} Department Students
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              You can only view attendance for {teacher.department} students
            </p>
          </div>

          {/* Statistics */}
          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>{totalRecords}</h3>
              <p>Total Records</p>
            </div>
            <div className="stat-card">
              <h3>{uniqueStudents}</h3>
              <p>Students</p>
            </div>
            <div className="stat-card">
              <h3>{todayRecords}</h3>
              <p>Today</p>
            </div>
            <div className="stat-card">
              <h3>{departmentStudents.length > 0 ? '95%' : '0%'}</h3>
              <p>Avg Attendance</p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>🔍 Filter Attendance</h3>
            
            <div className="form-group">
              <label className="form-label">Search Student</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Filter by Date</label>
              <input
                type="date"
                className="form-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            {(searchTerm || filterDate) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterDate('');
                }}
              >
                ❌ Clear Filters
              </button>
            )}
          </div>

          {/* Attendance Records */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>
              📋 Attendance Records ({filteredData.length})
            </h3>

            {filteredData.length === 0 ? (
              <div className="status-card status-info">
                <span className="icon">ℹ️</span>
                <span>
                  {departmentStudents.length === 0 
                    ? `No attendance records for ${teacher.department} students yet.` 
                    : 'No records match your filters.'}
                </span>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredData.map((record, index) => (
                  <div key={index} className="attendance-record-card">
                    <div className="attendance-record-header">
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                          {record.studentName}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                          Student ID: {record.studentId}
                        </p>
                        <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#666' }}>
                          {record.course} - Year {record.year} - {record.department}
                        </p>
                      </div>
                      <div className="attendance-status-badge">
                        ✅ {record.status}
                      </div>
                    </div>
                    
                    <div className="attendance-record-details">
                      <div className="attendance-detail-item">
                        <span className="icon">📅</span>
                        <span>{record.date}</span>
                      </div>
                      <div className="attendance-detail-item">
                        <span className="icon">⏰</span>
                        <span>{record.time}</span>
                      </div>
                      <div className="attendance-detail-item">
                        <span className="icon">📍</span>
                        <span>{record.latitude}, {record.longitude}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          {filteredData.length > 0 && (
            <button
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
              onClick={() => {
                const csvContent = [
                  ['Student Name', 'Student ID', 'Year', 'Course', 'Department', 'Date', 'Time', 'Status', 'Latitude', 'Longitude'],
                  ...filteredData.map(r => [
                    r.studentName,
                    r.studentId,
                    r.year,
                    r.course,
                    r.department,
                    r.date,
                    r.time,
                    r.status,
                    r.latitude,
                    r.longitude
                  ])
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${teacher.department}_attendance_${new Date().toLocaleDateString()}.csv`;
                link.click();
              }}
            >
              <span className="icon">📥</span> Export Attendance Data (CSV)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;