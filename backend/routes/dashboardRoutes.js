import express from 'express';
import {
  getDashboardStats,
  getDashboardCharts,
  getRecentActivity,
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats',            getDashboardStats);
router.get('/charts',           getDashboardCharts);
router.get('/recent-activity',  getRecentActivity);

export default router;
