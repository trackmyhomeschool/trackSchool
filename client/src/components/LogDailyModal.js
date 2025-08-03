import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './LogDailyModal.css';
import { useNavigate } from 'react-router-dom';


function LogDailyModal({ show, handleClose, student, onRefresh }) {
  if (!student) return null;

  const [subjectInput, setSubjectInput] = useState('');
  const [selectedCombo, setSelectedCombo] = useState('');
  const [comment, setComment] = useState('');
  const [percentage, setPercentage] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [status, setStatus] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();
  // Update subjects from student prop
  useEffect(() => {
    if (student && Array.isArray(student.subjects)) {
      setSubjectOptions(
        student.subjects
          .map(s => (typeof s.subjectName === 'string' ? s.subjectName : null))
          .filter(Boolean)
      );
    } else {
      setSubjectOptions([]);
    }
  }, [student]);

  // ComboBox selection updates text field
  useEffect(() => {
    if (selectedCombo) setSubjectInput(selectedCombo);
  }, [selectedCombo]);

  // Reset modal fields on open/close
  useEffect(() => {
    if (show) {
      setSubjectInput('');
      setSelectedCombo('');
      setComment('');
      setPercentage('');
      setStudyTime('');
      setStatus('');
      setMessage(null);
    }
  }, [show]);

  // Check if current subjectInput matches any subject (case-insensitive)
  const isRegisteredSubject = subjectOptions.some(
    s =>
      ((s || '').trim().toLowerCase() === (subjectInput || '').trim().toLowerCase())
  );

  // Save log and fetch updated student
  const handleSave = async () => {
    setMessage(null);

    if (!(subjectInput || '').trim()) {
      setMessage('Subject is required.');
      return;
    }

    // If subject is not registered, ask for confirmation to create
    if (!isRegisteredSubject) {
      setShowCreateModal(true);
      return;
    }

    await saveLog(subjectInput.trim());
  };

  // Save log function
  const saveLog = async (subjectName) => {
    setLoading(true);
    try {
      const payload = {
        studentId: student._id,
        subjectName: (subjectName || '').trim(),
        comment: (comment || '').trim() || 'No comment',
        studyTimeMinutes: studyTime ? parseInt(studyTime) : 0,
        percentage: parseInt(student.grade) > 5 ? parseFloat(percentage) : undefined,
        status: parseInt(student.grade) <= 5 ? status : null,
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/dailyLogs`,
        payload,
        { withCredentials: true }
      );
      setMessage('✓ Log saved!');
      setShowCreateModal(false);

      // Refresh student (for subject list consistency)
      const { data: updatedStudent } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/students/${student._id}`,
        { withCredentials: true }
      );
      if (typeof onRefresh === 'function') onRefresh(updatedStudent);

      // Add this for instant local update!
      setSubjectOptions(
        Array.isArray(updatedStudent.subjects)
          ? updatedStudent.subjects
              .map(s => (typeof s.subjectName === 'string' ? s.subjectName : null))
              .filter(Boolean)
          : []
      );

      setSubjectInput('');
      setSelectedCombo('');
      setComment('');
      setPercentage('');
      setStatus('');
      setStudyTime('');
    } catch (err) {
      setMessage('❌ Error saving log. Please ensure subject is valid.');
      setShowCreateModal(false);
    }
    setLoading(false);
  };

  // Create/register new subject and log
  const handleCreateSubject = async () => {
    await saveLog(subjectInput.trim());
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Log Daily Activity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <Alert variant={message.startsWith("✓") ? "success" : "info"}>
            {message}
          </Alert>
        )}

        {/* Subject ComboBox */}
        <Form.Group className="mb-2">
          <Form.Label>Choose Subject</Form.Label>
          <Form.Select
            value={selectedCombo}
            onChange={(e) => setSelectedCombo(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {subjectOptions.map((s, idx) => (
              <option key={idx} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Subject Input */}
        <Form.Group controlId="subjectInput" className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            list="subjectList"
            placeholder="Type or select subject"
            value={subjectInput}
            onChange={(e) => {
              setSubjectInput(e.target.value);
              setSelectedCombo(""); // If user types, reset ComboBox
            }}
            autoComplete="off"
          />
          <datalist id="subjectList">
            {subjectOptions.map((s, idx) => (
              <option key={idx} value={s} />
            ))}
          </datalist>
        </Form.Group>

        <Form.Group controlId="commentInput" className="mb-3">
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Activity Completed"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Form.Group>

        {parseInt(student?.grade) <= 5 ? (
          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Check
              type="radio"
              label="Pass"
              name="status"
              value="pass"
              checked={status === "pass"}
              onChange={(e) => setStatus(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="Fail"
              name="status"
              value="fail"
              checked={status === "fail"}
              onChange={(e) => setStatus(e.target.value)}
            />
          </Form.Group>
        ) : (
          <Form.Group controlId="percentage" className="mb-3">
            <Form.Label>Percentage</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 85"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
          </Form.Group>
        )}

        <Form.Group controlId="studyTime" className="mb-3">
          <Form.Label>Study Time (minutes)</Form.Label>
          <Form.Control
            type="number"
            min={0}
            placeholder="e.g. 30"
            value={studyTime}
            onChange={(e) => setStudyTime(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <div>
          <Button
            className='see-btn '
            variant="outline-info"
            onClick={() => {
              navigate(`/students?view=${student._id}`);
            }}
            disabled={loading}
          >
            See Logs
          </Button>
        </div>
        <div>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Close
          </Button>
          <Button
            variant={isRegisteredSubject ? "primary" : "success"}
            onClick={handleSave}
            disabled={loading}
            className="ms-2 log-btn"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : isRegisteredSubject ? (
              "Save Log"
            ) : (
              "New Log"
            )}
          </Button>
        </div>
      </Modal.Footer>

      {/* Register Subject Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title>Register Subject?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The subject "<b>{subjectInput}</b>" is not registered for this
          student. Do you want to proceed and register it?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreateSubject}>
            Yes, Register &amp; Save Log
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
}

export default LogDailyModal;
