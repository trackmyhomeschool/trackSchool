const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const DailyLog = require('../models/DailyLog');
const jwt = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware'); // Import protect

router.use('/chat', require('./adminChat'));

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'supersecret123';

// Admin-only middleware
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admins only' });
}

// Admin login
router.post('/login', (req, res) => {
   console.log("req.secure:", req.secure);
  console.log("req.headers['x-forwarded-proto']:", req.headers['x-forwarded-proto']);
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const payload = {
      username,
      role: 'admin'
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',

      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});  


// Get all users with their student count
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().lean();
    const usersWithCounts = await Promise.all(users.map(async user => {
      const studentCount = await Student.countDocuments({ user: user._id });
      return { ...user, studentCount };
    }));
    res.json(usersWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});


router.delete('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const students = await Student.find({ user: req.params.id }, '_id');
    const studentIds = students.map(s => s._id);

    if (studentIds.length > 0) {
      await DailyLog.deleteMany({ student: { $in: studentIds } });
    }
    await Student.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all associated students and logs deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router;
