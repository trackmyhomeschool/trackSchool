// ✅ UPDATED studentRoutes.js (cleaned and fixed)
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createStudent,
  getStudents,
  deleteStudent,
  uploadStudentImage,
  getStudentById,
  getTodayLog,
  createOrRegisterSubject
} = require('../controllers/studentController');

router.use(protect);

// ✅ Student-related routes
// router.post('/', uploadStudentImage, createStudent);
router.post('/register-subject', createOrRegisterSubject);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.get('/:studentId/subjects/:subjectId/log', getTodayLog);
router.delete('/:id', deleteStudent);

router.post(
  '/students',
  uploadStudentImage,
  (err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 2MB limit.' });
    }
    if (err) return res.status(500).json({ message: 'Image upload failed.' });
    next();
  },
  createStudent
);

module.exports = router;
