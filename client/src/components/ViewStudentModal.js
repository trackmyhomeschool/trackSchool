import React, { useEffect, useState } from "react";
import { Modal, Image } from "react-bootstrap";
import axios from "axios";

function ViewStudentModal({ show, handleClose, student }) {
  const [subjects, setSubjects] = useState([]);
  const [logFilter, setLogFilter] = useState("all");

  useEffect(() => {
    if (!show || !student || !student._id) return;

    const fetchLogs = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/students/${student._id}`
        );
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Error fetching student logs:", err);
      }
    };

    fetchLogs();
  }, [student, show]);

  const getProfilePicture = () => {
    if (!student?.profilePicture) return "/images/default-avatar.jpg";
    return student.profilePicture.startsWith("/uploads")
      ? `${process.env.REACT_APP_API_URL}${student.profilePicture}`
      : student.profilePicture;
  };

  const isPrimaryStudent = student?.grade <= 5;

  const calculateGPAFromPercent = (pct) => {
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
    return 0.0;
  };

  const calculateSubjectStats = (subject) => {
    const logs = subject.dailyLogs || [];

    const passCount = logs.filter((l) => l.status === "pass").length;
    const failCount = logs.filter((l) => l.status === "fail").length;
    const majority = passCount >= failCount ? "Pass" : "Fail";

    if (isPrimaryStudent) {
      return { average: majority, gpa: majority };
    } else {
      const validLogs = logs.filter((l) => typeof l.percentage === "number");
      const avg =
        validLogs.reduce((sum, log) => sum + log.percentage, 0) /
        (validLogs.length || 1);
      return {
        average: `${avg.toFixed(2)}%`,
        gpa: calculateGPAFromPercent(avg).toFixed(1),
      };
    }
  };

  const totalCredits =
    student?.subjects?.reduce(
      (sum, subj) => sum + (subj.creditHours || 0),
      0
    ) || 0;
  const totalHours =
    student?.subjects
      ?.reduce((sum, subj) => sum + (subj.totalHours || 0), 0)
      .toFixed(2) || 0;

  const overallStatus = (() => {
    let passCount = 0;
    let failCount = 0;
    subjects.forEach((subject) => {
      const logs = subject.dailyLogs || [];
      passCount += logs.filter((log) => log.status === "pass").length;
      failCount += logs.filter((log) => log.status === "fail").length;
    });
    return passCount >= failCount ? "Pass" : "Fail";
  })();

  const filterLogsByDate = (logs) => {
    if (logFilter === "all") return logs;

    const now = new Date();
    let cutoff;
    switch (logFilter) {
      case "today":
        cutoff = new Date(now.toISOString().split("T")[0]);
        return logs.filter(
          (log) => new Date(log.date).toDateString() === cutoff.toDateString()
        );
      case "lastWeek":
        cutoff = new Date(now.setDate(now.getDate() - 7));
        return logs.filter((log) => new Date(log.date) >= cutoff);
      case "lastMonth":
        cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 1);
        return logs.filter((log) => new Date(log.date) >= cutoff);
      case "lastYear":
        cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        return logs.filter((log) => new Date(log.date) >= cutoff);
      default:
        return logs;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Student Overview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            paddingRight: "10px",
            paddingLeft: "10px",
          }}
        >
          <div className="text-center mb-4">
            <Image
              src={getProfilePicture()}
              roundedCircle
              width={120}
              height={120}
              style={{ objectFit: "cover" }}
              onError={(e) => (e.target.src = "/images/default-avatar.jpg")}
            />
          </div>

          <h4 className="text-center">
            {student?.firstName} {student?.lastName}
          </h4>
          <div className="text-center my-3">
            <strong>Total Credits:</strong> {totalCredits} &nbsp;&nbsp;
            {isPrimaryStudent ? (
              <>
                <strong>Status:</strong> {overallStatus}
              </>
            ) : (
              <>
                <strong>GPA:</strong> {student?.gpa || 0.0} &nbsp;&nbsp;
                <strong>Total Hours:</strong> {totalHours}
              </>
            )}
          </div>

          <div className="mt-4">
            <h5 className="mb-3">Subjects Summary</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr>
                    <th>Subject</th>
                    <th>Credits</th>
                    <th>{isPrimaryStudent ? "Result" : "Percentage"}</th>
                    <th>{isPrimaryStudent ? "Status" : "Grade"}</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => {
                    const stats = calculateSubjectStats(subject);
                    return (
                      <tr key={subject.subjectName}>
                        <td>{subject.subjectName}</td>
                        <td>{subject.creditHours || 0}</td>
                        <td>{stats.average}</td>
                        <td>{stats.gpa}</td>
                        <td>{(subject.totalHours || 0).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h5 className="mb-3 mt-4 d-flex justify-content-between align-items-center">
              <span>Logs by Date</span>
              <select
                className="form-select form-select-sm input-d"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                style={{ width: "160px" }}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="lastWeek">Last Week</option>
                <option value="lastMonth">Last Month</option>
                <option value="lastYear">Last Year</option>
              </select>
            </h5>

            {(() => {
              const allLogs = [];
              subjects.forEach((subject) => {
                (subject.dailyLogs || []).forEach((log) => {
                  const d = new Date(log.logDate);
                  allLogs.push({
                    subjectName: subject.subjectName,
                    // ✅ if invalid or missing, use empty string
                    date: isNaN(d) ? "" : d.toISOString().split("T")[0],
                    comment: log.comment,
                    percentOrStatus: isPrimaryStudent
                      ? log.status === "pass"
                        ? "Pass"
                        : "Fail"
                      : `${(log.percentage || 0).toFixed(2)}%`,
                  });
                });
              });

              const filteredLogs = filterLogsByDate(allLogs);
              const logsByDate = {};

              filteredLogs.forEach((log) => {
                if (!logsByDate[log.date]) logsByDate[log.date] = [];
                logsByDate[log.date].push(log);
              });

              const sortedDates = Object.keys(logsByDate).sort(
                (a, b) => new Date(b) - new Date(a)
              );

              return sortedDates.map((date) => (
                <div key={date} className="mb-4">
                  <h6 className="over-title text-center mt-4 mb-3">
                    <span role="img" aria-label="calendar">
                      📅
                    </span>{" "}
                    {new Date(date).toLocaleDateString()}
                  </h6>
                  {logsByDate[date].map((log, idx) => (
                    <div key={idx} className="card card-border px-3 py-2 mb-2">
                      <strong className="card-title mb-0">
                        {log.subjectName}
                      </strong>
                      <span>{log.comment}</span>
                      <span>{log.percentOrStatus}</span>
                    </div>
                  ))}
                </div>
              ));
            })()}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
export default ViewStudentModal;
