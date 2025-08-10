import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CompletionLogModal({ show, handleClose, student, onRefresh }) {
  if (!student) return null;

  const navigate = useNavigate();
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedCombo, setSelectedCombo] = useState('');
  const [isCompleted, setIsCompleted] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [logDate, setLogDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Overlay style (same as your birth date modal)
  const calendarOverlayStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    zIndex: 2000,
    transform: "translate(-50%, -50%)",
    background: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 4px 32px rgba(25, 118, 210, 0.15)",
    padding: "18px",
    minWidth: "300px",
  };

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

  useEffect(() => {
    if (selectedCombo) {
      setSubjectInput(selectedCombo);
      const match = student.subjects?.find(
        s =>
          typeof s.subjectName === 'string' &&
          s.subjectName.trim().toLowerCase() === selectedCombo.trim().toLowerCase()
      );
      setIsCompleted(match?.isCompleted ?? null);
    }
  }, [selectedCombo, student.subjects]);

  useEffect(() => {
    if (show) {
      setSubjectInput('');
      setSelectedCombo('');
      setIsCompleted(null);
      setMessage(null);
      setLogDate('');
    }
  }, [show]);

  const handleSubjectChange = (e) => {
    setSubjectInput(e.target.value);
    setSelectedCombo('');
    const match = student.subjects?.find(
      s =>
        typeof s.subjectName === 'string' &&
        s.subjectName.trim().toLowerCase() === e.target.value.trim().toLowerCase()
    );
    setIsCompleted(match?.isCompleted ?? null);
  };

  const handleDaySelect = (date) => {
    if (date) {
      setLogDate(date.toISOString().split('T')[0]); // YYYY-MM-DD
      setShowCalendar(false);
    }
  };

  const isRegisteredSubject = subjectOptions.some(
    s => (s || '').trim().toLowerCase() === (subjectInput || '').trim().toLowerCase()
  );

  const handleSave = async () => {
    setMessage(null);
    if (!(subjectInput || '').trim()) return setMessage('Subject is required.');
    if (isCompleted === null) return setMessage('Please select completion status.');
    if (!logDate) return setMessage('Please select a date.');

    const inputTrimmed = (subjectInput || '').trim();

    if (!isRegisteredSubject) {
      setShowCreateModal(true);
      return;
    }

    await saveCompletion(inputTrimmed);
  };

  const saveCompletion = async (subjectName) => {
    console.log('Saving completion for:', subjectName, 'isCompleted:', isCompleted, 'logDate:', logDate);
    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/dailyLogs/${student._id}/${encodeURIComponent(subjectName)}/update-completion`,
        { isCompleted, logDate },
        { withCredentials: true }
      );

      setMessage('✓ Completion status saved!');
      setShowCreateModal(false);

      const { data: updatedStudent } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/students/${student._id}`,
        { withCredentials: true }
      );
      if (typeof onRefresh === 'function') onRefresh(updatedStudent);

      setSubjectOptions(
        Array.isArray(updatedStudent.subjects)
          ? updatedStudent.subjects
              .map(s => (typeof s.subjectName === 'string' ? s.subjectName : null))
              .filter(Boolean)
          : []
      );

      setSubjectInput('');
      setSelectedCombo('');
      setIsCompleted(null);
      setLogDate('');
    } catch (err) {
      setMessage('❌ Error saving completion status.');
      setShowCreateModal(false);
    }
    setLoading(false);
  };

  const handleCreateSubject = async () => {
    await saveCompletion((subjectInput || '').trim());
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Log Completion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <Alert variant={message.startsWith('✓') ? 'success' : 'info'}>
            {message}
          </Alert>
        )}

        {/* Subject ComboBox */}
        <Form.Group className="mb-2">
          <Form.Label>Choose Subject</Form.Label>
          <Form.Select
            value={selectedCombo}
            onChange={e => setSelectedCombo(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {subjectOptions.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
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
            onChange={handleSubjectChange}
          />
          <datalist id="subjectList">
            {subjectOptions.map((s, idx) => (
              <option key={idx} value={s} />
            ))}
          </datalist>
        </Form.Group>

        {/* Styled Date Picker (same as birth date modal) */}
        <Form.Group className="mb-3" style={{ position: "relative" }}>
          <Form.Label>Log Date</Form.Label>
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <Form.Control
              value={logDate}
              readOnly
              required
              onClick={() => setShowCalendar(true)}
              style={{
                borderRadius: "8px",
                fontSize: "1.05rem",
                padding: "8px",
                width: "100%",
                background: "#fff",
                cursor: "pointer",
                color: logDate ? "#1976d2" : "#555",
                fontWeight: 500,
              }}
              placeholder=""
              autoComplete="off"
            />
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "40%",
                transform: "translateY(-50%)",
                color: "#1976d2",
                fontSize: 22,
                pointerEvents: "none",
              }}
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z" />
              </svg>
            </span>
          </div>
          {showCalendar && (
            <>
              <div
                style={{
                  position: "fixed",
                  left: 0,
                  top: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 1999,
                  background: "rgba(0,0,0,0.15)"
                }}
                onClick={() => setShowCalendar(false)}
              />
              <div style={calendarOverlayStyle}>
                <DayPicker
                  mode="single"
                  selected={logDate ? new Date(logDate) : undefined}
                  onSelect={handleDaySelect}
                  fromYear={1980}
                  toYear={new Date().getFullYear()}
                  disabled={[{ after: new Date() }]}
                  captionLayout="dropdown"
                  modifiersClassNames={{
                    selected: 'my-selected',
                    today: 'my-today'
                  }}
                  styles={{
                    caption: { color: "#1976d2" },
                    head_cell: { color: "#1976d2" },
                    day_selected: { backgroundColor: "#1976d2", color: "#fff" },
                  }}
                />
                <div style={{ textAlign: "right", marginTop: 8 }}>
                  <Button size="sm" variant="outline-secondary" onClick={() => setShowCalendar(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </Form.Group>

        {/* Completion Status */}
        <Form.Group controlId="completion" className="mb-3">
          <Form.Label>Completion Status</Form.Label>
          <Form.Check
            type="radio"
            label="Completed"
            name="completion"
            value="true"
            checked={isCompleted === true}
            onChange={() => setIsCompleted(true)}
          />
          <Form.Check
            type="radio"
            label="Not Completed"
            name="completion"
            value="false"
            checked={isCompleted === false}
            onChange={() => setIsCompleted(false)}
          />
        </Form.Group>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <div>
          <Button
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
            className="ms-2"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : isRegisteredSubject ? (
              "Save Status"
            ) : (
              "New Status"
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
          The subject "<b>{subjectInput}</b>" is not registered for this student. Do you want to proceed and register it?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCreateSubject}>
            Yes, Register &amp; Save Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
}

export default CompletionLogModal;
