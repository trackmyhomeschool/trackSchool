import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Button, Table } from "react-bootstrap";
import { FaEye, FaTrashAlt, FaEdit } from "react-icons/fa";
import AddStudentModal from "../components/AddStudentModal";
import EditStudentModal from "../components/EditStudentModal";
import ViewStudentModal from "../components/ViewStudentModal";
import CompletionViewModal from "../components/CompletionViewModal";
import axios from "axios";
import "./Students.css";

import { useLocation, useNavigate } from "react-router-dom";

const gradeLabels = {
  0: "Kindergarten",
  1: "1st Grade",
  2: "2nd Grade",
  3: "3rd Grade",
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
  9: "9th Grade",
  10: "10th Grade",
  11: "11th Grade",
  12: "12th Grade",
};

// 🔥 Custom hook to watch the dashboard search bar!
function useDashboardSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const input = document.querySelector(".dashboard-topbar .search-input");
    if (!input) return;
    setSearchTerm(input.value);
    const handler = () => setSearchTerm(input.value);
    input.addEventListener("input", handler);
    return () => input.removeEventListener("input", handler);
  }, []);
  return searchTerm;
}

function Students() {
  const location = useLocation();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showViewStudentModal, setShowViewStudentModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [creditDefinition, setCreditDefinition] = useState("");
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const searchTerm = useDashboardSearch();

  useEffect(() => {
    fetchStudents();
    fetchUserState();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/students`,
        {
          withCredentials: true,
        }
      );

      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students:", err.message);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewId = params.get("view");
    if (viewId && students.length > 0) {
      const fetchAndShow = async () => {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/students/${viewId}`
          );
          setSelectedStudent(res.data);
          if (creditDefinition === "Carnegie Unit") {
            setShowViewStudentModal(true);
          } else {
            setShowCompletionModal(true);
          }
          navigate("/students", { replace: true });
        } catch (err) {
          console.error("Error fetching student for modal:", err);
        }
      };
      fetchAndShow();
    }
  }, [location.search, creditDefinition]);

  const fetchUserState = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/me`,
        {
          withCredentials: true,
        }
      );

      setCreditDefinition(res.data?.state?.creditDefinition || "");
    } catch (err) {
      console.error("Failed to fetch user state:", err.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/students/${id}`,
        {
          withCredentials: true,
        }
      );

      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete student:", err.message);
      alert("Error deleting student");
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    if (creditDefinition === "Carnegie Unit") {
      setShowViewStudentModal(true);
    } else {
      setShowCompletionModal(true);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowEditStudentModal(true);
  };

  const getProfilePictureUrl = (profilePicture) => {
    if (typeof profilePicture !== "string" || !profilePicture) {
      return "/images/default-avatar.jpg";
    }
    return profilePicture.startsWith("/uploads") ||
      profilePicture.startsWith("/images")
      ? `${process.env.REACT_APP_API_URL}${profilePicture}`
      : profilePicture;
  };

  // 🔥 Live filtered students based on search bar:
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const grade = (gradeLabels[s.grade] || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    return name.includes(q) || grade.includes(q) || email.includes(q);
  });

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="text-black">Students</h3>
          <p className="text-muted">Manage your homeschool students</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddStudentModal(true)}>
          + Add Student
        </Button>
      </div>

      <AddStudentModal
        show={showAddStudentModal}
        handleClose={() => setShowAddStudentModal(false)}
        onStudentAdded={(newStudent) =>
          setStudents((prev) => [...prev, newStudent])
        }
      />

      <div className="card">
        <div className="card-body p-2">
          <Table responsive hover className="custom-table bordered-table mb-0">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>GPA</th>
                <th>Birth Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td>
                    <img
                      src={getProfilePictureUrl(s.profilePicture)}
                      alt="avatar"
                      style={{
                        width: "32px",
                        height: "32px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    {s.firstName} {s.lastName}
                  </td>
                  <td>{gradeLabels[s.grade] || "—"}</td>
                  <td>{s.gpa}</td>
                  <td>
                    {s.birthDate
                      ? new Date(s.birthDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="me-2 p-2 border-unset  bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={() => handleViewStudent(s)}
                    >
                      <FaEye />
                    </Button>

                    <Button
                      variant="outline-dark"
                      size="sm"
                      className="me-2 p-2 border-unset bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={() => handleEditStudent(s)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="p-2 border-unset bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={() => handleDeleteStudent(s._id)}
                    >
                      <FaTrashAlt />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <ViewStudentModal
        show={showViewStudentModal}
        handleClose={() => setShowViewStudentModal(false)}
        student={selectedStudent}
      />
      <EditStudentModal
        show={showEditStudentModal}
        handleClose={() => setShowEditStudentModal(false)}
        student={editingStudent}
        onStudentUpdated={(updatedStudent) =>
          setStudents((prev) =>
            prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
          )
        }
      />

      <CompletionViewModal
        show={showCompletionModal}
        handleClose={() => setShowCompletionModal(false)}
        student={selectedStudent}
      />
    </DashboardLayout>
  );
}
export default Students;
