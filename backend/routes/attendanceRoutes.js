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
import { protect, adminOnly, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/check-in',     authorize('employee'), checkIn);
router.put('/check-out',     authorize('employee'), checkOut);
router.get('/today',         authorize('employee'), getTodayAttendance);
router.get('/my-history',    authorize('employee'), getMyAttendance);
router.get('/',              adminOnly, getAllAttendance);
router.post('/mark',         adminOnly, markAttendance);
router.get('/report',        adminOnly, getAttendanceReport);

export default router;
