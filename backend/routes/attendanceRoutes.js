import express from 'express';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance,
  markAttendance,
  getAttendanceReport,
} from '../controllers/attendanceController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/check-in',     checkIn);
router.put('/check-out',     checkOut);
router.get('/today',         getTodayAttendance);
router.get('/my-history',    getMyAttendance);
router.get('/',              adminOnly, getAllAttendance);
router.post('/mark',         adminOnly, markAttendance);
router.get('/report',        adminOnly, getAttendanceReport);

export default router;
