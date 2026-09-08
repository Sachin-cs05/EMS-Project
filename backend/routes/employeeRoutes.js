// ════════════════════════════════════════════════════════════════
//  employeeRoutes.js
// ════════════════════════════════════════════════════════════════
import express from 'express';
import {
  getAllEmployees, getEmployee, createEmployee,
  updateEmployee, deleteEmployee, uploadProfileImage,
} from '../controllers/employeeController.js';
import { protect, adminOnly, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(adminOnly, getAllEmployees)
  .post(adminOnly, upload.single('profileImage'), createEmployee);

router.route('/:id')
  .get(authorize('admin', 'employee'), getEmployee)
  .put(adminOnly, upload.single('profileImage'), updateEmployee)
  .delete(adminOnly, deleteEmployee);

router.put(
  '/:id/profile-image',
  authorize('admin', 'employee'),
  upload.single('profileImage'),
  uploadProfileImage
);

export default router;


// ════════════════════════════════════════════════════════════════
//  departmentRoutes.js  (paste into separate file)
// ════════════════════════════════════════════════════════════════
// import express from 'express';
// import { getDepartments, createDepartment, updateDepartment, deleteDepartment }
//   from '../controllers/departmentController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';
// const router = express.Router();
// router.use(protect);
// router.route('/').get(getDepartments).post(adminOnly, createDepartment);
// router.route('/:id').put(adminOnly, updateDepartment).delete(adminOnly, deleteDepartment);
// export default router;


// ════════════════════════════════════════════════════════════════
//  attendanceRoutes.js  (paste into separate file)
// ════════════════════════════════════════════════════════════════
// import express from 'express';
// import { checkIn, checkOut, getTodayAttendance, getMyAttendance,
//          getAllAttendance, markAttendance, getAttendanceReport }
//   from '../controllers/attendanceController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';
// const router = express.Router();
// router.use(protect);
// router.post('/check-in',   checkIn);
// router.put('/check-out',   checkOut);
// router.get('/today',       getTodayAttendance);
// router.get('/my-history',  getMyAttendance);
// router.get('/',            adminOnly, getAllAttendance);
// router.post('/mark',       adminOnly, markAttendance);
// router.get('/report',      adminOnly, getAttendanceReport);
// export default router;


// ════════════════════════════════════════════════════════════════
//  leaveRoutes.js  (paste into separate file)
// ════════════════════════════════════════════════════════════════
// import express from 'express';
// import { applyLeave, getMyLeaves, cancelLeave,
//          getAllLeaves, approveLeave, rejectLeave }
//   from '../controllers/leaveController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';
// const router = express.Router();
// router.use(protect);
// router.post('/apply',          applyLeave);
// router.get('/my-leaves',       getMyLeaves);
// router.put('/:id/cancel',      cancelLeave);
// router.get('/',                adminOnly, getAllLeaves);
// router.put('/:id/approve',     adminOnly, approveLeave);
// router.put('/:id/reject',      adminOnly, rejectLeave);
// export default router;


// ════════════════════════════════════════════════════════════════
//  dashboardRoutes.js  (paste into separate file)
// ════════════════════════════════════════════════════════════════
// import express from 'express';
// import { getDashboardStats, getDashboardCharts, getRecentActivity }
//   from '../controllers/dashboardController.js';
// import { protect, adminOnly } from '../middleware/authMiddleware.js';
// const router = express.Router();
// router.use(protect, adminOnly);
// router.get('/stats',           getDashboardStats);
// router.get('/charts',          getDashboardCharts);
// router.get('/recent-activity', getRecentActivity);
// export default router;


// ════════════════════════════════════════════════════════════════
//  notificationRoutes.js  (paste into separate file)
// ════════════════════════════════════════════════════════════════
// import express from 'express';
// import { getNotifications, markAsRead, markAllAsRead }
//   from '../controllers/dashboardController.js';
// import { protect } from '../middleware/authMiddleware.js';
// const router = express.Router();
// router.use(protect);
// router.get('/',           getNotifications);
// router.put('/:id/read',   markAsRead);
// router.put('/read-all',   markAllAsRead);
// export default router;
