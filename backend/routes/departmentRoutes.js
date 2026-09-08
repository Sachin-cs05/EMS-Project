// ════════════════════════════════════════════════════════════════════════════
//  routes/departmentRoutes.js
// ════════════════════════════════════════════════════════════════════════════
import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(adminOnly, getDepartments)
  .post(adminOnly, createDepartment);

router.route('/:id')
  .put(adminOnly, updateDepartment)
  .delete(adminOnly, deleteDepartment);

export default router;


// ════════════════════════════════════════════════════════════════════════════
//  routes/attendanceRoutes.js
// ════════════════════════════════════════════════════════════════════════════
// import express from 'express';
// import {
//   checkIn, checkOut, getTodayAttendance, getMyAttendance,
//   getAllAttendance, markAttendance, getAttendanceReport,
// } from '../controllers/attendanceController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';
//
// const router = express.Router();
// router.use(protect);
//
// router.post('/check-in',        checkIn);
// router.put('/check-out',        checkOut);
// router.get('/today',            getTodayAttendance);
// router.get('/my-history',       getMyAttendance);
// router.get('/',                 adminOnly, getAllAttendance);
// router.post('/mark',            adminOnly, markAttendance);
// router.get('/report',           adminOnly, getAttendanceReport);
//
// export default router;


// ════════════════════════════════════════════════════════════════════════════
//  routes/leaveRoutes.js
// ════════════════════════════════════════════════════════════════════════════
// import express from 'express';
// import {
//   applyLeave, getMyLeaves, cancelLeave,
//   getAllLeaves, approveLeave, rejectLeave,
// } from '../controllers/leaveController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';
//
// const router = express.Router();
// router.use(protect);
//
// router.post('/apply',           applyLeave);
// router.get('/my-leaves',        getMyLeaves);
// router.put('/:id/cancel',       cancelLeave);
// router.get('/',                 adminOnly, getAllLeaves);
// router.put('/:id/approve',      adminOnly, approveLeave);
// router.put('/:id/reject',       adminOnly, rejectLeave);
//
// export default router;


// ════════════════════════════════════════════════════════════════════════════
//  routes/dashboardRoutes.js
// ════════════════════════════════════════════════════════════════════════════
// import express from 'express';
// import {
//   getDashboardStats, getDashboardCharts, getRecentActivity,
// } from '../controllers/dashboardController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';
//
// const router = express.Router();
// router.use(protect, adminOnly);
//
// router.get('/stats',            getDashboardStats);
// router.get('/charts',           getDashboardCharts);
// router.get('/recent-activity',  getRecentActivity);
//
// export default router;


// ════════════════════════════════════════════════════════════════════════════
//  routes/notificationRoutes.js
// ════════════════════════════════════════════════════════════════════════════
// import express from 'express';
// import {
//   getNotifications, markAsRead, markAllAsRead,
// } from '../controllers/dashboardController.js';
// import { protect } from '../middleware/authMiddleware.js';
//
// const router = express.Router();
// router.use(protect);
//
// router.get('/',            getNotifications);
// router.put('/:id/read',    markAsRead);
// router.put('/read-all',    markAllAsRead);
//
// export default router;
