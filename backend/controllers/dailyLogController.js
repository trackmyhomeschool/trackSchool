const DailyLog = require('../models/DailyLog');
const Student = require('../models/Student');
const User = require('../models/User');

// Create or Update a Daily Log
exports.createLog = async (req, res) => {
  try {
    const {
      studentId,
      subjectName,
      comment,
      percentage = 0,
      studyTimeMinutes = 0,
      status
    } = req.body;

    if (!comment) return res.status(400).json({ error: 'Comment is required' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Find subject in student's subjects array
    let subject = student.subjects.find(
      s => s.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase()
    );

    // Auto-register subject if missing
    if (!subject) {
      subject = {
        subjectName: subjectName.trim(),
        totalHours: 0,
        creditHours: 0,
        isCompleted: false
      };
      student.subjects.push(subject);
    }

    const today = new Date().toISOString().split('T')[0];

    // --- Always create a new DailyLog (no upsert/update) ---
    const newLog = new DailyLog({
      student: studentId,
      subjectName: subject.subjectName,
      date: today,
      comment,
      studyTimeMinutes,
    });

    if (parseInt(student.grade) > 5) {
      const pct = parseFloat(percentage);
      newLog.percentage = Math.min(Math.max(pct || 0, 0), 100);
    } else {
      if (['pass', 'fail'].includes(status)) {
        newLog.status = status;
      }
    }

    await newLog.save();

    // Update totalHours and creditHours for subject (add this log's minutes)
    let embedded = student.subjects.find(
      s => s.subjectName.trim().toLowerCase() === subject.subjectName.trim().toLowerCase()
    );
    const user = await User.findById(req.user.id);
    if(embedded){
      const deltaHours = studyTimeMinutes / 60;
      embedded.totalHours = Math.max((embedded.totalHours || 0) + deltaHours, 0);
      embedded.creditHours = calculateCredits(embedded.totalHours, user.hoursPerCredit);
    }

    await recalculateStudentGPA(student);
    await student.save();

    return res.status(200).json({ message: 'Daily log saved successfully', log: newLog });

  } catch (error) {
    console.error('❌ Error saving daily log:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Credit Calculation
function calculateCredits(hours, hoursPerCredit) {
  if (hours >= hoursPerCredit) return 1;
  if (hours >= hoursPerCredit / 2) return 0.5;
  if (hours >= hoursPerCredit / 4) return 0.25;
  return 0;
}

// GPA Scale (unchanged)
 function percentageToGPA(pct) {
  if (pct >= 97) return 4.0;         // A+
  if (pct >= 93) return 4.0;         // A
  if (pct >= 90) return 3.7;         // A-
  if (pct >= 87) return 3.3;         // B+
  if (pct >= 83) return 3.0;         // B
  if (pct >= 80) return 2.7;         // B-
  if (pct >= 77) return 2.3;         // C+
  if (pct >= 73) return 2.0;         // C
  if (pct >= 70) return 1.7;         // C-
  if (pct >= 67) return 1.3;         // D+
  if (pct >= 65) return 1.0;         // D
  return 0.0;                        // E/F
}

async function recalculateStudentGPA(student) {
  let totalCredits = 0;
  let totalWeightedGPA = 0;

  for (const subj of student.subjects) {
    // Fetch logs for this subject
    const logs = await DailyLog.find({
      student: student._id,
      subjectName: subj.subjectName
    });
    const validLogs = logs.filter(log => log.percentage > 0 && log.studyTimeMinutes > 0);

    if (validLogs.length === 0 || !subj.creditHours) continue; // skip subjects with no logs or no credits

    const weightedTotal = validLogs.reduce((sum, log) => sum + (log.percentage * log.studyTimeMinutes), 0);
    const totalTime = validLogs.reduce((sum, log) => sum + log.studyTimeMinutes, 0);
    const weightedPct = weightedTotal / totalTime;

    const subjGPA = percentageToGPA(weightedPct);
    totalWeightedGPA += subjGPA * subj.creditHours;
    totalCredits += subj.creditHours;
  }

  if (totalCredits === 0) {
    student.gpa = 0;
  } else {
    student.gpa = (totalWeightedGPA / totalCredits).toFixed(2);
  }
}

// Check if student has logged for a subject before
exports.hasLoggedSubjectBefore = async (req, res) => {
  const { studentId, subjectName } = req.params;
  try {
    const log = await DailyLog.findOne({ student: studentId, subjectName });
    return res.status(200).json({ hasLog: !!log });
  } catch (err) {
    console.error('❌ Error checking log history:', err);
    return res.status(500).json({ error: 'Failed to check log history' });
  }
};

// Fetch Today’s Log
exports.getTodaysLog = async (req, res) => {
  const { studentId, subjectName, date } = req.params;
  try {
    const log = await DailyLog.findOne({ student: studentId, subjectName, date });
    if (!log) return res.status(404).json({ message: 'No log found for today' });
    res.status(200).json(log);
  } catch (err) {
    console.error('❌ Error fetching today log:', err);
    res.status(500).json({ message: 'Failed to fetch log', error: err.message });
  }
};

// Update Completion Status

exports.updateCompletionStatus = async (req, res) => {
  const { studentId, subjectName } = req.params;
  const { isCompleted } = req.body;

  if (!studentId || !subjectName)
    return res.status(400).json({ error: 'studentId and subjectName are required' });

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    let embedded = student.subjects.find(
      s => (s.subjectName || '').trim().toLowerCase() === (subjectName || '').trim().toLowerCase()
    );

    // Auto-register subject if missing
    if (!embedded) {
      embedded = {
        subjectName: (subjectName || '').trim(),
        totalHours: 0,
        creditHours: 0,
        isCompleted: false
      };
      student.subjects.push(embedded);
    }

    // Update status and adjust credit
    const wasCompleted = embedded.isCompleted;
    embedded.isCompleted = isCompleted;

    if (isCompleted && !wasCompleted) {
      embedded.creditHours += 1;
    } else if (!isCompleted && wasCompleted) {
      embedded.creditHours = Math.max((embedded.creditHours || 0) - 1, 0);
    }

    await student.save();
    return res.status(200).json({ message: 'Completion status updated successfully' });
  } catch (error) {
    console.error('❌ Error updating completion status:', error);
    return res.status(500).json({ error: 'Failed to update completion status' });
  }
};
