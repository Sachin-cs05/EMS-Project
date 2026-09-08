import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from '../controllers/leaveController.js';
import { protect, adminOnly, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/apply',        authorize('employee'), applyLeave);
router.get('/my-leaves',     authorize('employee'), getMyLeaves);
router.put('/:id/cancel',    authorize('employee'), cancelLeave);
router.get('/',              adminOnly, getAllLeaves);
router.put('/:id/approve',   adminOnly, approveLeave);
router.put('/:id/reject',    adminOnly, rejectLeave);

export default router;
