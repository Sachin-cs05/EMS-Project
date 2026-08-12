import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from '../controllers/leaveController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/apply',        applyLeave);
router.get('/my-leaves',     getMyLeaves);
router.put('/:id/cancel',    cancelLeave);
router.get('/',              adminOnly, getAllLeaves);
router.put('/:id/approve',   adminOnly, approveLeave);
router.put('/:id/reject',    adminOnly, rejectLeave);

export default router;
