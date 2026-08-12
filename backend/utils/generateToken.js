import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for a user.
 * @param {string} userId - MongoDB ObjectId as string
 * @param {string} role   - 'admin' | 'employee'
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

export default generateToken;
