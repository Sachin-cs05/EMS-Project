import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Protect routes — verifies JWT and attaches req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized — no token provided'));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  try {
    const user = await User.findById(decoded.id).select(
      '-password -resetPasswordToken -resetPasswordExpires'
    );

    if (!user) {
      return next(new ApiError(401, 'User no longer exists'));
    }
    if (!user.isActive) {
      return next(new ApiError(403, 'Your account has been deactivated'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Restrict to admin role only
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Access denied — Admin only'));
  }
  next();
};

/**
 * Restrict to specific roles
 * @param  {...string} roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new ApiError(403, `Role '${req.user?.role}' is not authorized`)
      );
    }
    next();
  };
};
