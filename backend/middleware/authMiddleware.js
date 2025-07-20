const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Always use JWT info only!
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admins only' });
}

module.exports = protect;

// const protect = (req, res, next) => {
//   const token = req.cookies.token;

//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // Always use JWT payload for user info
//     req.user = {
//       id: decoded.id,                // might be undefined for admin
//       username: decoded.username,
//       role: decoded.role             // <-- always from JWT!
//     };
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Token invalid' });
//   }
// };

