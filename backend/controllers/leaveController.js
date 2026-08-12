import Leave        from '../models/Leave.js';
import Employee     from '../models/Employee.js';
import Notification from '../models/Notification.js';
import User         from '../models/User.js';
import sendEmail    from '../utils/sendEmail.js';
import ApiError     from '../utils/ApiError.js';
import ApiResponse  from '../utils/ApiResponse.js';

// ─── APPLY LEAVE (Employee) ───────────────────────────────────────────────────
export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return next(new ApiError(404, 'Employee profile not found'));

    // Calculate days
    const days = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Check leave balance
    const balance = employee.leaveBalance[leaveType];
    if (balance < days) {
      return next(new ApiError(400, `Insufficient ${leaveType} leave balance. Available: ${balance} days`));
    }

    // Check overlapping leave
    const overlap = await Leave.findOne({
      employee: employee._id,
      status:   { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: new Date(endDate)   }, endDate: { $gte: new Date(startDate) } },
      ],
    });
    if (overlap) {
      return next(new ApiError(400, 'You already have a leave request overlapping this period'));
    }

    const leave = await Leave.create({
      employee:  employee._id,
      leaveType,
      startDate: new Date(startDate),
      endDate:   new Date(endDate),
      reason,
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin', isActive: true });
    await Notification.insertMany(
      admins.map(a => ({
        recipient: a._id,
        title:     'New Leave Request',
        message:   `${employee.firstName} ${employee.lastName} applied for ${days} day(s) of ${leaveType} leave.`,
        type:      'leave_applied',
        link:      `/admin/leaves`,
      }))
    );

    res.status(201).json(new ApiResponse(201, { leave }, 'Leave application submitted'));
  } catch (e) { next(e); }
};

// ─── MY LEAVES (Employee) ─────────────────────────────────────────────────────
export const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return next(new ApiError(404, 'Employee not found'));

    const leaves = await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, {
      leaves,
      leaveBalance: employee.leaveBalance,
    }, 'Leave history'));
  } catch (e) { next(e); }
};

// ─── CANCEL LEAVE (Employee) ──────────────────────────────────────────────────
export const cancelLeave = async (req, res, next) => {
  try {
    const leave    = await Leave.findById(req.params.id);
    const employee = await Employee.findOne({ userId: req.user._id });

    if (!leave) return next(new ApiError(404, 'Leave not found'));
    if (leave.employee.toString() !== employee._id.toString()) {
      return next(new ApiError(403, 'Access denied'));
    }
    if (leave.status !== 'pending') {
      return next(new ApiError(400, `Cannot cancel a ${leave.status} leave`));
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json(new ApiResponse(200, { leave }, 'Leave cancelled'));
  } catch (e) { next(e); }
};

// ─── ALL LEAVES (Admin) ───────────────────────────────────────────────────────
export const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status)    query.status    = status;
    if (leaveType) query.leaveType = leaveType;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Leave.countDocuments(query);

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName employeeId profileImage department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(new ApiResponse(200, {
      leaves,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    }, 'All leaves'));
  } catch (e) { next(e); }
};

// ─── APPROVE LEAVE (Admin) ────────────────────────────────────────────────────
export const approveLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return next(new ApiError(404, 'Leave not found'));
    if (leave.status !== 'pending') {
      return next(new ApiError(400, `Leave is already ${leave.status}`));
    }

    leave.status      = 'approved';
    leave.reviewedBy  = req.user._id;
    leave.reviewNote  = req.body.note || '';
    leave.reviewedAt  = new Date();
    await leave.save();

    // Deduct leave balance
    const employee = await Employee.findById(leave.employee._id);
    employee.leaveBalance[leave.leaveType] -= leave.totalDays;
    await employee.save();

    // Notify employee
    await Notification.create({
      recipient: leave.employee.userId,
      title:     'Leave Approved ✅',
      message:   `Your ${leave.leaveType} leave request for ${leave.totalDays} day(s) has been approved.`,
      type:      'leave_approved',
      link:      '/employee/leaves',
    });

    // Email notification
    const user = await User.findById(leave.employee.userId);
    try {
      await sendEmail({
        to:      user.email,
        subject: 'EMS — Leave Request Approved',
        html:    `<p>Hi ${leave.employee.firstName}, your leave request has been <strong>approved</strong>.</p>`,
      });
    } catch (_) {}

    res.status(200).json(new ApiResponse(200, { leave }, 'Leave approved'));
  } catch (e) { next(e); }
};

// ─── REJECT LEAVE (Admin) ─────────────────────────────────────────────────────
export const rejectLeave = async (req, res, next) => {
  try {
    const { note } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return next(new ApiError(404, 'Leave not found'));
    if (leave.status !== 'pending') {
      return next(new ApiError(400, `Leave is already ${leave.status}`));
    }

    leave.status     = 'rejected';
    leave.reviewedBy = req.user._id;
    leave.reviewNote = note || '';
    leave.reviewedAt = new Date();
    await leave.save();

    await Notification.create({
      recipient: leave.employee.userId,
      title:     'Leave Rejected ❌',
      message:   `Your ${leave.leaveType} leave request has been rejected. ${note ? `Reason: ${note}` : ''}`,
      type:      'leave_rejected',
      link:      '/employee/leaves',
    });

    const user = await User.findById(leave.employee.userId);
    try {
      await sendEmail({
        to:      user.email,
        subject: 'EMS — Leave Request Rejected',
        html:    `<p>Hi ${leave.employee.firstName}, your leave has been <strong>rejected</strong>.${note ? ` Reason: ${note}` : ''}</p>`,
      });
    } catch (_) {}

    res.status(200).json(new ApiResponse(200, { leave }, 'Leave rejected'));
  } catch (e) { next(e); }
};
