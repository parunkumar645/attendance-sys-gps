// ============================================
// FILE: src/App.jsx
// ============================================
import React, { useState } from 'react';
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import './App.css';

function App() {
  const [userType, setUserType] = useState(null); // 'student' or 'teacher'
  const [attendanceData, setAttendanceData] = useState([]);

  const handleLogout = () => {
    setUserType(null);
  };

  const addAttendanceRecord = (record) => {
    setAttendanceData([record, ...attendanceData]);
  };

  if (!userType) {
    return (
      <div className="app-container">
        <div className="header">
          <h1>📱 Smart Attendance System</h1>
          <p>Face Recognition + GPS Location Lock</p>
        </div>

        <div className="main-card">
          <h2 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>
            Choose Portal
          </h2>

          <button
            className="btn btn-primary"
            onClick={() => setUserType('student')}
            style={{ marginBottom: '15px' }}
          >
            <span className="icon">👨‍🎓</span>
            Student Portal
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setUserType('teacher')}
          >
            <span className="icon">👨‍🏫</span>
            Teacher Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {userType === 'student' && (
        <StudentPortal
          onLogout={handleLogout}
          onAttendanceMarked={addAttendanceRecord}
          allAttendance={attendanceData}
        />
      )}
      {userType === 'teacher' && (
        <TeacherPortal
          onLogout={handleLogout}
          attendanceData={attendanceData}
        />
      )}
    </>
  );
}

export default App;