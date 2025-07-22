import React, { useRef, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import './Transcript.css';
import { toPng } from 'html-to-image';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function getGradeAndGPA(percent) {
  if (percent >= 97) return { grade: "A+", gpa: 4.0 };
  if (percent >= 93) return { grade: "A", gpa: 4.0 };
  if (percent >= 90) return { grade: "A-", gpa: 3.7 };
  if (percent >= 87) return { grade: "B+", gpa: 3.3 };
  if (percent >= 83) return { grade: "B", gpa: 3.0 };
  if (percent >= 80) return { grade: "B-", gpa: 2.7 };
  if (percent >= 77) return { grade: "C+", gpa: 2.3 };
  if (percent >= 73) return { grade: "C", gpa: 2.0 };
  if (percent >= 70) return { grade: "C-", gpa: 1.7 };
  if (percent >= 67) return { grade: "D+", gpa: 1.3 };
  if (percent >= 65) return { grade: "D", gpa: 1.0 };
  return { grade: "E/F", gpa: 0.0 };
}

function TranscriptPreview() {
  const ref = useRef();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const exportToImage = () => {
    if (!ref.current) return;
    toPng(ref.current, { cacheBust: true, backgroundColor: 'white' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'transcript.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error('Export failed:', err));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [studentRes, userRes] = await Promise.all([
         axios.get(`${process.env.REACT_APP_API_URL}/api/students/${id}`, { withCredentials: true }),
         axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, { withCredentials: true })
        ]);
        setStudent(studentRes.data);
        setUser(userRes.data);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  if (loading)
    return <DashboardLayout><p className="text-center p-5">Loading...</p></DashboardLayout>;
  if (error || !student || !user)
    return <DashboardLayout><p className="text-danger text-center p-5">{error}</p></DashboardLayout>;

  const gradeNum = parseInt(student.grade);
  const creditDef = user?.state?.creditDefinition || '';
  const isPrimary = !isNaN(gradeNum) && gradeNum <= 5;

  const totalCredits = student.subjects.reduce((sum, subj) => {
    if (creditDef === 'Carnegie Unit' || creditDef === 'Local') {
      if (!isNaN(gradeNum) && gradeNum >= 6) {
        return sum + (subj.creditHours || 0);
      } else {
        const logs = subj.dailyLogs || [];
        const passCount = logs.filter((l) => l.status === 'pass').length;
        const failCount = logs.filter((l) => l.status === 'fail').length;
        const passed = passCount >= failCount;
        return sum + (passed ? (subj.creditHours || 0) : 0);
      }
    } else {
      return sum + (subj.isCompleted ? (subj.creditHours || 0) : 0);
    }
  }, 0);

  // GPA calculation for grades 6+ only, using weighted average of course GPA by credits
  let cumulativeGPA = null;
  let courseRows = [];
  if ((creditDef === 'Carnegie Unit' || creditDef === 'Local') && gradeNum >= 6) {
    let totalWeightedGPA = 0;
    let totalEarnedCredits = 0;
    courseRows = student.subjects.map((subj, idx) => {
      const credit = subj.creditHours || 0;
      const logs = subj.dailyLogs || [];
      let percent = null;
      if (subj.totalMarks > 0 && subj.obtainedMarks >= 0) {
        percent = (subj.obtainedMarks / subj.totalMarks) * 100;
      }
      if (percent === null || isNaN(percent)) {
        const validLogs = logs.filter(log => typeof log.percentage === 'number');
        if (validLogs.length > 0) {
          const sum = validLogs.reduce((acc, log) => acc + log.percentage, 0);
          percent = sum / validLogs.length;
        }
      }
      let gradeInfo = { grade: "Incomplete", gpa: "–" };
      let earnedCredits = "0.00";
      if (percent != null) {
        gradeInfo = getGradeAndGPA(percent);
        earnedCredits = credit.toFixed(2);
        totalWeightedGPA += gradeInfo.gpa * credit;
        totalEarnedCredits += credit;
      }
      return (
        <div className="table-row" key={idx}>
          <div className="w-50">{subj.subjectName}</div>
          <div>{percent != null ? `${Math.round(percent)}% (${gradeInfo.grade})` : "Incomplete"}</div>
          <div>{earnedCredits}</div>
          <div>{gradeInfo.gpa !== "–" ? gradeInfo.gpa.toFixed(2) : "–"}</div>
        </div>
      );
    });
    cumulativeGPA = totalEarnedCredits > 0 ? (totalWeightedGPA / totalEarnedCredits) : 0;
  } else {
    // For lower grades or other credit types
    courseRows = student.subjects.map((subj, idx) => {
      const credit = subj.creditHours || 0;
      const logs = subj.dailyLogs || [];
      let percent = null;
      if (subj.totalMarks > 0 && subj.obtainedMarks >= 0) {
        percent = (subj.obtainedMarks / subj.totalMarks) * 100;
      }
      if (percent === null || isNaN(percent)) {
        const validLogs = logs.filter(log => typeof log.percentage === 'number');
        if (validLogs.length > 0) {
          const sum = validLogs.reduce((acc, log) => acc + log.percentage, 0);
          percent = sum / validLogs.length;
        }
      }
      let gradeInfo = { grade: "Incomplete", gpa: "–" };
      let earnedCredits = "0.00";
      if (creditDef === 'Carnegie Unit' || creditDef === 'Local') {
        if (!isNaN(gradeNum) && gradeNum < 6) {
          const passCount = logs.filter(l => l.status === 'pass').length;
          const failCount = logs.filter(l => l.status === 'fail').length;
          const isPass = passCount >= failCount;
          const finalGrade = logs.length > 0 ? (isPass ? 'Pass' : 'Fail') : 'Incomplete';
          earnedCredits = (finalGrade === 'Pass' ? credit.toFixed(2) : '0.00');
          return (
            <div className="table-row" key={idx}>
              <div className="w-50">{subj.subjectName}</div>
              <div>{finalGrade}</div>
              <div>{earnedCredits}</div>
              <div>–</div>
            </div>
          );
        }
      }
      if (percent != null) {
        gradeInfo = getGradeAndGPA(percent);
        earnedCredits = credit.toFixed(2);
      }
      return (
        <div className="table-row" key={idx}>
          <div className="w-50">{subj.subjectName}</div>
          <div>{percent != null ? `${Math.round(percent)}% (${gradeInfo.grade})` : "Incomplete"}</div>
          <div>{earnedCredits}</div>
          <div>{gradeInfo.gpa !== "–" ? gradeInfo.gpa.toFixed(2) : "–"}</div>
        </div>
      );
    });
  }

  return (
    <DashboardLayout>
      <div className="export-bar">
        <button onClick={exportToImage} className="export-button">Export as Image</button>
      </div>

      <div className="export-wrapper">
        <div ref={ref} className="transcript-container">
          <div className="black-header">Official Transcript</div>

          <div className="student-info-row">
            <div className="student-left">
              <p className="name-bold">{student.firstName} {student.lastName}</p>
              <p>DOB: {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : 'N/A'}</p>
              <p>{user.email}</p>
            </div>
            <div className="student-right">
              <p className="school-name">Homeschool</p>
              <p>Grade: {student.grade || 'N/A'}</p>
              <p>{user?.state?.name || 'State not specified'}</p>
            </div>
          </div>

          <div className="courses-box">
            <div className="table-header">
              <div className="w-50">Course</div>
              <div>
                {(creditDef === 'Carnegie Unit' || creditDef === 'Local')
                  ? (gradeNum >= 6 ? 'Final Grade (Letter)' : 'Pass/Fail')
                  : 'Status'}
              </div>
              <div>Credits Earned</div>
              <div>
                {(creditDef === 'Carnegie Unit' || creditDef === 'Local')
                  ? (gradeNum >= 6 ? 'Course GPA' : '—')
                  : '—'}
              </div>
            </div>
            {courseRows}
          </div>

          <div className="transcript-summary">
            <p>
              {creditDef === 'Carnegie Unit' || creditDef === 'Local'
                ? (gradeNum >= 6 ? 'Total Cumulative Credits' : 'Total Passed Credits')
                : 'Total Completed Credits'
              }: {totalCredits.toFixed(2)}
            </p>
            {(creditDef === 'Carnegie Unit' || creditDef === 'Local') && gradeNum >= 6 ? (
              <>
                <p>Cumulative GPA: {cumulativeGPA !== null ? cumulativeGPA.toFixed(3) : "0.000"}</p>
                <p>Total Cumulative Credits: {totalCredits.toFixed(2)}</p>
              </>
            ) : (
              <p style={{ color: '#999' }}><i>GPA not applicable for this grade level or state</i></p>
            )}
          </div>

          <div className="transcript-scale" style={{marginTop: 18, textAlign: "center", fontSize: "0.98em", color: "#444"}}>
  <strong>GPA Scale:</strong>
  <div>
    A+/A (97-100/93-96): 4.0 A- (90-92): 3.7 B+ (87-89): 3.3 B (83-86): 3.0 B- (80-82): 2.7 C+ (77-79): 2.3 
  </div>
  <div>
    C (73-76): 2.0  C- (70-72): 1.7 D+ (67-69): 1.3 D (65-66): 1.0 E/F (below 65): 0.0
  </div>
</div>


        </div>
      </div>
    </DashboardLayout>
  );
}

export default TranscriptPreview;
