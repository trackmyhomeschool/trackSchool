import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const gradeOptions = {
  Kindergarten: 0,
  "1st Grade": 1,
  "2nd Grade": 2,
  "3rd Grade": 3,
  "4th Grade": 4,
  "5th Grade": 5,
  "6th Grade": 6,
  "7th Grade": 7,
  "8th Grade": 8,
  "9th Grade": 9,
  "10th Grade": 10,
  "11th Grade": 11,
  "12th Grade": 12,
};

const calendarOverlayStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  zIndex: 2000,
  transform: "translate(-50%, -50%)",
  background: "#fff",
  borderRadius: "1rem",
  boxShadow: "0 4px 32px rgba(25, 118, 210, 0.15)",
  border: "1px solid #1976d2",
  padding: "18px",
  minWidth: "300px",
};

function EditStudentModal({ show, handleClose, student, onStudentUpdated }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    grade: "",
    profilePicture: null,
  });
  const [error, setError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Pre-fill when modal opens
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        birthDate: student.birthDate
          ? new Date(student.birthDate).toISOString().slice(0, 10)
          : "",
        grade: student.grade !== undefined ? student.grade : "",
        profilePicture: null,
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError(
        "File size must be less than 2MB. Please upload a smaller image."
      );
      e.target.value = null;
      setFormData((prev) => ({ ...prev, profilePicture: null }));
    } else {
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      setError("");
    }
  };

  const handleDaySelect = (date) => {
    if (date) {
      const dateStr = date.toISOString().slice(0, 10);
      setFormData((prev) => ({ ...prev, birthDate: dateStr }));
      setShowCalendar(false);
    }
  };

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowCalendar(false);
    };
    if (showCalendar) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCalendar]);

  React.useEffect(() => {
    document.body.style.overflow = showCalendar ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCalendar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, birthDate, grade, profilePicture } = formData;

    if (!firstName || !lastName || !birthDate || grade === "") {
      setError("Please fill in all required fields.");
      return;
    }

    const today = new Date();
    const bDate = new Date(birthDate);
    if (bDate > today) {
      setError("Student should be minimum one year old.");
      return;
    }
    const ageInMs = today - bDate;
    const oneYearMs = 1000 * 60 * 60 * 24 * 365.25;
    if (ageInMs < oneYearMs) {
      setError("Student should be minimum one year old.");
      return;
    }

    const data = new FormData();
    data.append("firstName", firstName);
    data.append("lastName", lastName);
    data.append("birthDate", birthDate);
    data.append("grade", grade);
    if (profilePicture) data.append("profilePicture", profilePicture);

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/students/${student._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      onStudentUpdated(res.data);
      handleClose();
    } catch (err) {
      if (
        err.response?.data?.message &&
        err.response.data.message.includes("2MB")
      ) {
        setError(
          "File size must be less than 2MB. Please upload a smaller image."
        );
      } else {
        setError(err.response?.data?.message || "Failed to update student");
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* First Name */}
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          {/* Last Name */}
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          {/* Birth Date */}
          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Label>Birth Date</Form.Label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Form.Control
                name="birthDate"
                value={formData.birthDate}
                readOnly
                required
                onClick={() => setShowCalendar(true)}
                style={{
                  borderRadius: "12px",
                  fontSize: "1.05rem",
                  padding: "10px 40px 10px 14px",
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #1976d2",
                  cursor: "pointer",
                  color: formData.birthDate ? "#1976d2" : "#555",
                  fontWeight: 500,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#1976d2",
                  fontSize: 22,
                  pointerEvents: "none",
                }}
              >
                📅
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
                    background: "rgba(0,0,0,0.15)",
                  }}
                  onClick={() => setShowCalendar(false)}
                />
                <div style={calendarOverlayStyle}>
                  <DayPicker
                    mode="single"
                    selected={
                      formData.birthDate
                        ? new Date(formData.birthDate)
                        : undefined
                    }
                    onSelect={handleDaySelect}
                    fromYear={1980}
                    toYear={new Date().getFullYear()}
                    disabled={[
                      { after: new Date() },
                      { before: new Date(1980, 0, 1) },
                    ]}
                    captionLayout="dropdown"
                  />
                  <div style={{ textAlign: "right", marginTop: 8 }}>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => setShowCalendar(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Form.Group>
          {/* Grade */}
          <Form.Group className="mb-3">
            <Form.Label>Grade</Form.Label>
            <Form.Select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
            >
              <option value="">Select Grade</option>
              {Object.entries(gradeOptions).map(([label, value]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {/* Profile Picture */}
          <Form.Group className="mb-3">
            <Form.Label>Profile Picture</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <Form.Text className="text-muted">
              (Max size: 2MB. Leave empty to keep existing picture.)
            </Form.Text>
          </Form.Group>
          {/* Error Message */}
          {error && <p className="text-danger">{error}</p>}
          {/* Submit */}
          <Button variant="primary" type="submit" className="mt-2 w-100">
            Update Student
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditStudentModal;
