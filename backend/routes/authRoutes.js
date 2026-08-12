import express from 'express';
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

router.post('/login',               login);
router.post('/forgot-password',     forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected
router.use(protect);
router.get('/me',              getMe);
router.post('/logout',         logout);
router.put('/change-password', changePassword);

export default router;
