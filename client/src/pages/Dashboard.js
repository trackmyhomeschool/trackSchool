import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import "./Dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#00bfff",
  "#ff69b4",
];

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
  12: "12th grade",
};

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/students`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!Array.isArray(data))
          throw new Error("Invalid student data received");
        setStudents(data);
        if (data.length > 0) setSelectedStudent(data[0]._id);
      } catch (err) {
        console.error("Failed to fetch students:", err.message);
        setStudents([]);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudent) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/students/${selectedStudent}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();
        setSelectedData(data);
      } catch (err) {
        console.error("Failed to fetch selected student data:", err.message);
      }
    };
    fetchStudentDetails();
  }, [selectedStudent]);

  const getLastWeekStudyHours = () => {
    if (!selectedData) return "0.0";
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    let minutes = 0;
    selectedData.subjects?.forEach((sub) => {
      sub.dailyLogs?.forEach((log) => {
        if (new Date(log.date) >= oneWeekAgo) {
          minutes += log.studyTimeMinutes || 0;
        }
      });
    });
    return (minutes / 60).toFixed(1);
  };

  function percentageToGPA(pct) {
    if (pct >= 97) return 4.0; // A+
    if (pct >= 93) return 4.0; // A
    if (pct >= 90) return 3.7; // A-
    if (pct >= 87) return 3.3; // B+
    if (pct >= 83) return 3.0; // B
    if (pct >= 80) return 2.7; // B-
    if (pct >= 77) return 2.3; // C+
    if (pct >= 73) return 2.0; // C
    if (pct >= 70) return 1.7; // C-
    if (pct >= 67) return 1.3; // D+
    if (pct >= 65) return 1.0; // D
    return 0.0; // E/F
  }

  const getMonthlyGpaData = () => {
    if (!selectedData) return [];
    const monthMap = {};
    selectedData.subjects?.forEach((sub) => {
      sub.dailyLogs?.forEach((log) => {
        if (log.percentage > 0) {
          const dateObj = new Date(log.date);
          const month = dateObj.toLocaleString("default", { month: "short" });
          const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
          if (!monthMap[key]) monthMap[key] = { month, percentages: [] };
          monthMap[key].percentages.push(log.percentage);
        }
      });
    });
    return Object.values(monthMap)
      .map(({ month, percentages }) => {
        const avgPct =
          percentages.reduce((a, b) => a + b, 0) / percentages.length;
        const gpa = percentageToGPA(avgPct);
        return { month, gpa: parseFloat(gpa.toFixed(2)) };
      })
      .sort(
        (a, b) => new Date(`1 ${a.month} 2020`) - new Date(`1 ${b.month} 2020`)
      );
  };

  const getPieData = () => {
    if (!selectedData) return [];

    // If creditDef is undefined or blank, default to hours (for most users)
    const creditDef =
      selectedData?.user?.state?.creditDefinition ||
      selectedData?.state?.creditDefinition ||
      "";

    // Fallback: if no creditDef, just always show hours
    if (!creditDef || creditDef === "Carnegie Unit" || creditDef === "Local") {
      return (
        selectedData.subjects?.map((sub) => ({
          name: sub.subjectName || "Unnamed",
          value: Math.round(sub.totalHours || 0),
        })) || []
      );
    } else {
      // By completed credits (unlikely for your data)
      return (
        selectedData.subjects
          ?.filter((sub) => sub.isCompleted)
          .map((sub) => ({
            name: sub.subjectName || "Unnamed",
            value: Number(sub.creditHours) || 0,
          })) || []
      );
    }
  };

  const getActivities = () =>
    selectedData?.activities?.slice(0, 5).map((a) => a.heading) || [];

  const totalStudents = students.length;
  const avgGPA =
    totalStudents > 0
      ? (
          students.reduce((sum, s) => sum + (s.gpa || 0), 0) / totalStudents
        ).toFixed(2)
      : "0.00";

  return (
    <DashboardLayout>
      <h2 className="mb-4 text-black">Dashboard</h2>

      <div className="row mb-4">
        <div className="col py-2">
          <div className="card shadow-none border h-100 bg-gradient-start-1">
            <div className="card-body p-20">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <p className="fw-medium card-text-s mb-1">Total Students</p>
                  <h6 className="mb-0">{totalStudents}</h6>
                </div>
                <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                  <i className="ri-group-fill text-white text-2xl mb-0"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col py-2">
          <div className="card shadow-none border h-100 bg-gradient-start-2">
            <div className="card-body p-20">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <p className="fw-medium card-text-s mb-1">Average GPA</p>
                  <h6 className="mb-0">{avgGPA}</h6>
                </div>
                <div className="w-50-px h-50-px bg-purple rounded-circle d-flex justify-content-center align-items-center">
                  <i className="ri-code-box-fill text-white text-2xl mb-0"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col py-2">
          <div className="card shadow-none border h-100 bg-gradient-start-3">
            <div className="card-body p-20">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <p className="fw-medium card-text-s mb-1">
                    Study Hours (Week)
                  </p>
                  <h6 className="mb-0">{getLastWeekStudyHours()}</h6>
                </div>
                <div className="w-50-px h-50-px bg-red rounded-circle d-flex justify-content-center align-items-center">
                  <i className="ri-time-fill text-white text-2xl mb-0"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col py-2">
          <div className="card shadow-none border h-100 bg-gradient-start-4">
            <div className="card-body p-20">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <p className="fw-medium card-text-s mb-1">Activities</p>
                  <h6 className="mb-0">
                    {selectedData?.activities?.length || 0}
                  </h6>
                </div>
                <div className="w-50-px h-50-px bg-success-main rounded-circle d-flex justify-content-center align-items-center">
                  <i className="ri-article-fill text-white text-2xl mb-0"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="text-black">Your Students</h5>
                <button
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={() => navigate("/students")}
                >
                  View all <i className="ri-arrow-drop-right-line"></i>
                </button>
              </div>
              <div className="student-list">
                {students.slice(0, 4).map((s) => (
                  <div
                    key={s._id}
                    className="student-entry d-flex align-items-center mb-3"
                  >
                    <img
                      src={
                        s.profilePicture?.startsWith("/uploads")
                          ? `${process.env.REACT_APP_API_URL}${s.profilePicture}`
                          : "/images/default-avatar.jpg"
                      }
                      alt="avatar"
                      className="rounded-circle"
                      style={{
                        width: "36px",
                        height: "36px",
                        objectFit: "cover",
                        marginRight: "10px",
                      }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 500 }}>
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="text-muted small">
                        {gradeLabels[s.grade] || "No grade"}
                      </div>
                    </div>
                    <div style={{ fontWeight: 500 }}>
                      {s.gpa !== undefined && s.gpa !== null
                        ? Number(s.gpa).toFixed(2)
                        : "0.00"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-12 mb-4">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-black">Academic Progress</h5>
                <select
                  className="form-select input-d"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  style={{ width: "200px" }}
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  height: "240px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getMonthlyGpaData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 col-md-12">
          <div className="card h-100">
            <div className="card-body">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0 text-black">Recent Activity</h5>
                  <button
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate("/activities")}
                  >
                    View all <i className="ri-arrow-drop-right-line"></i>
                  </button>
                </div>
                {getActivities().length === 0 ? (
                  <p className="text-muted">No activities recorded yet.</p>
                ) : (
                  <ul style={{ listStyle: "disc", paddingLeft: "1.2rem" }}>
                    {getActivities().map((heading, idx) => (
                      <li
                        key={idx}
                        style={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        {heading}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-12">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex gap-4 flex-wrap">
                <div>
                  <h5 className="mb-2 text-black">Study Hours by Subject</h5>

                  {getPieData().length === 0 ? (
                    <p className="text-muted">No subject data available.</p>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <PieChart width={300} height={240}>
                        <Pie
                          data={getPieData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name }) => name}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {getPieData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${parseInt(value)} hours`}
                        />
                        <Legend />
                      </PieChart>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
