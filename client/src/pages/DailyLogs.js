import React, { useEffect, useState } from 'react';
import './DailyLogs.css';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Button } from 'react-bootstrap';
import axios from 'axios';
import LogDailyModal from '../components/LogDailyModal';
import CompletionLogModal from '../components/CompletionLogModal';
import { useNavigate } from 'react-router-dom';

function DailyLogs() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [creditDefinition, setCreditDefinition] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUserState = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, { withCredentials: true });
      setCreditDefinition(res.data?.state?.creditDefinition || '');
    } catch (err) {
      console.error('Error fetching user state:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students`, { withCredentials: true });
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const fetchFullStudent = async (studentId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students/${studentId}`, { withCredentials: true });
      setSelectedStudent(res.data);
    } catch (err) {
      console.error('Failed to fetch full student data', err);
    }
  };

  useEffect(() => {
    fetchUserState();
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  const openLogModal = (student) => {
    fetchFullStudent(student._id);
    if (creditDefinition === 'Carnegie Unit') {
      setShowLogModal(true);
    } else {
      setShowCompletionModal(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="daily-logs-wrapper">
        <h3>Daily Logs</h3>
        <p className="text-muted">Log activities for each student</p>

        {students.map((student) => (
          <Card className="mb-3" key={student._id}>
            <Card.Body>
              <div
                className="dailylog-row"
                style={{ display: "flex", alignItems: "center" }}
              >
                <img
                  src={
                    student.profilePicture?.startsWith("/uploads")
                      ? `${process.env.REACT_APP_API_URL}${student.profilePicture}`
                      : "/images/default-avatar.jpg"
                  }
                  alt="avatar"
                  className="dailylog-avatar"
                />
                <div className="dailylog-info" style={{ flex: 1 }}>
                  <strong>
                    {student.firstName} {student.lastName}
                  </strong>
                </div>
                <div
                  style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}
                >
                  <Button
                    className="see-btn"
                    variant="outline-info"
                    onClick={() => {
                      setLoading(true);
                      navigate(`/students?view=${student._id}`);
                    }}
                    disabled={loading}
                  >
                    See Log
                  </Button>
                  <button
                    className="log-btn"
                    onClick={() => openLogModal(student)}
                  >
                    Today's Log
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}

        <LogDailyModal
          show={showLogModal}
          handleClose={() => {
            setShowLogModal(false);
            setTimeout(fetchStudents, 300);
          }}
          student={selectedStudent}
          onRefresh={fetchStudents}
        />

        <CompletionLogModal
          show={showCompletionModal}
          handleClose={() => {
            setShowCompletionModal(false);
            setTimeout(fetchStudents, 300);
          }}
          student={selectedStudent}
          onRefresh={fetchStudents}
        />
      </div>
    </DashboardLayout>
  );
}

export default DailyLogs;
