import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

function CompletionLogModal({ show, handleClose, student, onRefresh }) {
  if (!student) return null;

  const [subjectInput, setSubjectInput] = useState('');
  const [selectedCombo, setSelectedCombo] = useState('');
  const [isCompleted, setIsCompleted] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Build safe subject options on every student change
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

  // ComboBox selection updates text field and completion
  useEffect(() => {
    if (selectedCombo) {
      setSubjectInput(selectedCombo);
      // auto-fill completion if subject found
      const match = student.subjects?.find(
        s =>
          typeof s.subjectName === 'string' &&
          s.subjectName.trim().toLowerCase() === selectedCombo.trim().toLowerCase()
      );
      if (match && typeof match.isCompleted === 'boolean') {
        setIsCompleted(match.isCompleted);
      } else {
        setIsCompleted(null);
      }
    }
  }, [selectedCombo, student.subjects]);

  // Reset modal fields on open/close
  useEffect(() => {
    if (show) {
      setSubjectInput('');
      setSelectedCombo('');
      setIsCompleted(null);
      setMessage(null);
    }
  }, [show]);

  // Subject input change with completion auto-fill
  const handleSubjectChange = (e) => {
    setSubjectInput(e.target.value);
    setSelectedCombo(''); // If typing, reset ComboBox selection

    // auto-fill completion if subject found
    const match = student.subjects?.find(
      s =>
        typeof s.subjectName === 'string' &&
        s.subjectName.trim().toLowerCase() === e.target.value.trim().toLowerCase()
    );
    if (match && typeof match.isCompleted === 'boolean') {
      setIsCompleted(match.isCompleted);
    } else {
      setIsCompleted(null);
    }
  };

  // Check if current subjectInput matches any subject (case-insensitive)
  const isRegisteredSubject = subjectOptions.some(
    s => (s || '').trim().toLowerCase() === (subjectInput || '').trim().toLowerCase()
  );

  const handleSave = async () => {
    setMessage(null);
    if (!(subjectInput || '').trim()) return setMessage('Subject is required.');
    if (isCompleted === null) return setMessage('Please select completion status.');

    const inputTrimmed = (subjectInput || '').trim();

    if (!isRegisteredSubject) {
      setShowCreateModal(true);
      return;
    }

    await saveCompletion(inputTrimmed);
  };

  const saveCompletion = async (subjectName) => {
    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/dailyLogs/${student._id}/${encodeURIComponent(subjectName)}/update-completion`,
        { isCompleted },
        { withCredentials: true }
      );

      setMessage('✓ Completion status saved!');
      setShowCreateModal(false);

      // --- Fetch updated student and update options instantly ---
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

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button
          variant={isRegisteredSubject ? "primary" : "success"}
          onClick={handleSave}
          disabled={loading}
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
