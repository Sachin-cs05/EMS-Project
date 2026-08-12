// ════════════════════════════════════════════════════════════════════════════
//  DASHBOARD CONTROLLER
// ════════════════════════════════════════════════════════════════════════════
import Employee    from '../models/Employee.js';
import Department  from '../models/Department.js';
import Attendance  from '../models/Attendance.js';
import Leave       from '../models/Leave.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'active' }),
      Department.countDocuments({ isActive: true }),
      Leave.countDocuments({ status: 'pending' }),
    ]);

    // Today's attendance summary
    const today = new Date();
    const startToday = new Date(today.setHours(0,  0,  0, 0));
    const endToday   = new Date(today.setHours(23, 59, 59, 999));

    const todayAttendance = await Attendance.aggregate([
      { $match: { date: { $gte: startToday, $lte: endToday } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const attSummary = { present: 0, absent: 0, late: 0, halfDay: 0 };
    todayAttendance.forEach(({ _id, count }) => {
      if (_id === 'present')  attSummary.present  = count;
      if (_id === 'absent')   attSummary.absent    = count;
      if (_id === 'late')     attSummary.late      = count;
      if (_id === 'half_day') attSummary.halfDay   = count;
    });

    res.status(200).json(new ApiResponse(200, {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      todayAttendance: attSummary,
    }, 'Dashboard stats'));
  } catch (e) { next(e); }
};

export const getDashboardCharts = async (req, res, next) => {
  try {
    // Department-wise employee count
    const deptWise = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { name: '$dept.name', count: 1, _id: 0 } },
    ]);

    // Monthly employee growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const growth = await Employee.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Leave statistics
    const leaveStats = await Leave.aggregate([
      { $group: { _id: '$leaveType', count: { $sum: 1 } } },
    ]);

    // Attendance trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const attendanceTrend = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id:     { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent']  }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late']    }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(new ApiResponse(200, {
      deptWise,
      growth,
      leaveStats,
      attendanceTrend,
    }, 'Chart data'));
  } catch (e) { next(e); }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const [recentHires, recentLeaves, recentAttendance] = await Promise.all([
      Employee.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('department', 'name')
        .select('firstName lastName employeeId profileImage createdAt designation'),
      Leave.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('employee', 'firstName lastName profileImage'),
      Attendance.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('employee', 'firstName lastName profileImage'),
    ]);

    res.status(200).json(new ApiResponse(200, {
      recentHires,
      recentLeaves,
      recentAttendance,
    }, 'Recent activity'));
  } catch (e) { next(e); }
};

// ════════════════════════════════════════════════════════════════════════════
//  NOTIFICATION CONTROLLER
// ════════════════════════════════════════════════════════════════════════════
import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead:    false,
    });

    res.status(200).json(
      new ApiResponse(200, { notifications, unreadCount }, 'Notifications fetched')
    );
  } catch (e) { next(e); }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.status(200).json(new ApiResponse(200, null, 'Marked as read'));
  } catch (e) { next(e); }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
  } catch (e) { next(e); }
};
