import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
});

router.post('/login', loginLimiter, login);
router.post('/forgot-password',     forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected
router.use(protect);
router.get('/me',              getMe);
router.post('/logout',         logout);
router.put('/change-password', changePassword);

export default router;
