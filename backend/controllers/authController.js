const Otp = require('../models/Otp');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const State = require('../models/State');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');



exports.login = async (req, res) => {
  const { emailOrUsername, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: 'user', username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    //setting the cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        username: user.username,
        state: user.state
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.status(204).send(); // or .json({ success: true }) for a 200
};


exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Special case: admin (JWT with no id, not in DB)
  if (req.user.role === 'admin') {
    return res.json({
      id: null,
      email: null,
      firstName: 'Admin',
      lastName: '',
      username: req.user.username,
      state: null,
      minCreditsRequired: null,
      hoursPerCredit: null,
      profilePicture: '',
      isTrial: false,
      isPremium: true,
      role: 'admin'
    });
  }

  // Normal users: fetch from DB
  const user = await User.findById(req.user.id).populate('state');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Calculate trial and premium status
  let isTrial = false;
  let isPremium = false;
  if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
    isTrial = true;
  }
  if (user.isSubscribed && (!user.subscriptionEndsAt || new Date(user.subscriptionEndsAt) > new Date())) {
    isPremium = true;
  }

  res.json({
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    state: user.state,
    minCreditsRequired: user.minCreditsRequired,
    hoursPerCredit: user.hoursPerCredit,
    profilePicture: user.profilePicture || '',
    isTrial,
    isPremium,
    role: user.role || 'user'
  });
};






// exports.sendOtp = async (req, res) => {
//   const { email } = req.body;
//   if (!email.includes('@')) return res.status(400).json({ message: 'Invalid email' });

//   const existing = await User.findOne({ email });
//   if (existing) return res.status(400).json({ message: 'Email already registered' });

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   await Otp.deleteMany({ email }); // remove old OTPs
//   await Otp.create({ email, otp });

//   // Configure mail
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.OTP_EMAIL,
//       pass: process.env.OTP_PASSWORD
//     }
//   });

//   const mailOptions = {
//     from: `"Track My Homeschool" <${process.env.OTP_EMAIL}>`,
//     to: email,
//     subject: 'Your OTP Code',
//     text: `Your OTP is: ${otp}. It will expire in 10 minutes.`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to send OTP', error: err.message });
//   }
// };


exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email.includes('@')) return res.status(400).json({ message: 'Invalid email' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ email }); // remove old OTPs
  await Otp.create({ email, otp });

  try {
    await sendEmail(
      email,
      'Your OTP Code',
      `Your OTP is: ${otp}. It will expire in 10 minutes.`
    );
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};


exports.verifyOtpAndRegister = async (req, res) => {
  const { firstName, lastName, email, username, password, state, otp } = req.body;

  const validOtp = await Otp.findOne({ email, otp });
  if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(400).json({ message: 'Email or username already exists' });

  // Use state as ObjectId
  const stateDoc = await State.findById(state);
  if (!stateDoc) return res.status(400).json({ message: 'Selected state is invalid' });

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    firstName,
    lastName,
    email,
    username,
    password: hashedPassword,
    state: stateDoc._id,
    minCreditsRequired: stateDoc.minCreditsRequired,
    hoursPerCredit: stateDoc.hoursPerCredit
  });

  await Otp.deleteMany({ email }); // clean up OTPs

  res.status(201).json({ message: 'User registered successfully' });
};


// Find user's email from username or email (for password reset)
exports.findUserEmail = async (req, res) => {
  let { usernameOrEmail } = req.body;
  if (!usernameOrEmail) {
    return res.status(400).json({ message: 'Username or email is required.' });
  }
  usernameOrEmail = usernameOrEmail.trim(); // <--- key line!
  console.log('Trimmed reset input:', usernameOrEmail);

  try {
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ email: user.email });
  } catch (err) {
    return res.status(500).json({ message: 'Error looking up user.', error: err.message });
  }
};



// Verify OTP for password reset (not for registration!)
exports.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }
  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    // OTP is valid, allow next step
    await Otp.deleteMany({ email }); // cleanup
    res.json({ message: 'OTP verified.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify OTP.', error: err.message });
  }
};

const passwordValidation = (pwd) => {
  return (
    pwd.length >= 6 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  );
};

// Reset password for user with verified OTP
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }
  if (!passwordValidation(newPassword)) {
    return res.status(400).json({ message: 'Password does not meet security requirements.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to reset password.', error: err.message });
  }
};


// Send OTP for password reset (to EXISTING emails only)
// exports.sendResetOtp = async (req, res) => {
//   const { email } = req.body;
//   if (!email.includes('@')) return res.status(400).json({ message: 'Invalid email' });

//   const existing = await User.findOne({ email });
//   if (!existing) return res.status(400).json({ message: 'Email not found.' });

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   await Otp.deleteMany({ email }); // remove old OTPs
//   await Otp.create({ email, otp });

//   // Configure mail
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.OTP_EMAIL,
//       pass: process.env.OTP_PASSWORD
//     }
//   });

//   const mailOptions = {
//     from: `"Track My Homeschool" <${process.env.OTP_EMAIL}>`,
//     to: email,
//     subject: 'Your Password Reset OTP Code',
//     text: `Your OTP is: ${otp}. It will expire in 10 minutes.`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to send OTP', error: err.message });
//   }
// };



exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email.includes('@')) return res.status(400).json({ message: 'Invalid email' });

  const existing = await User.findOne({ email });
  if (!existing) return res.status(400).json({ message: 'Email not found.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ email }); // remove old OTPs
  await Otp.create({ email, otp });

  try {
    await sendEmail(
      email,
      'Your Password Reset OTP Code',
      `Your OTP is: ${otp}. It will expire in 10 minutes.`
    );
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};
