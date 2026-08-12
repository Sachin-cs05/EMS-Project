import Attendance from '../models/Attendance.js';
import Employee   from '../models/Employee.js';
import ApiError   from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const startOfDay = (d = new Date()) => new Date(d.setHours(0,  0,  0, 0));
const endOfDay   = (d = new Date()) => new Date(d.setHours(23, 59, 59, 999));

// ─── CHECK-IN (Employee) ──────────────────────────────────────────────────────
export const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return next(new ApiError(404, 'Employee profile not found'));

    const today = new Date();
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: startOfDay(new Date(today)), $lte: endOfDay(new Date(today)) },
    });

    if (existing?.checkIn) {
      return next(new ApiError(400, 'Already checked in today'));
    }

    // Determine status based on time (late if after 9:30 AM)
    const hour   = today.getHours();
    const minute = today.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 30);

    const attendance = existing
      ? await Attendance.findByIdAndUpdate(
          existing._id,
          { checkIn: today, status: isLate ? 'late' : 'present' },
          { new: true }
        )
      : await Attendance.create({
          employee: employee._id,
          date:     startOfDay(new Date()),
          checkIn:  today,
          status:   isLate ? 'late' : 'present',
        });

    res.status(200).json(new ApiResponse(200, { attendance }, 'Check-in recorded'));
  } catch (e) { next(e); }
};

// ─── CHECK-OUT (Employee) ─────────────────────────────────────────────────────
export const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return next(new ApiError(404, 'Employee profile not found'));

    const today = new Date();
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: startOfDay(new Date(today)), $lte: endOfDay(new Date(today)) },
    });

    if (!attendance?.checkIn) {
      return next(new ApiError(400, 'Please check in first'));
    }
    if (attendance.checkOut) {
      return next(new ApiError(400, 'Already checked out today'));
    }

    attendance.checkOut = today;
    await attendance.save(); // pre-save hook calculates workHours

    res.status(200).json(new ApiResponse(200, { attendance }, 'Check-out recorded'));
  } catch (e) { next(e); }
};

// ─── GET TODAY (Employee) ─────────────────────────────────────────────────────
export const getTodayAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return next(new ApiError(404, 'Employee not found'));

    const today = new Date();
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: startOfDay(new Date(today)), $lte: endOfDay(new Date(today)) },
    });

    res.status(200).json(new ApiResponse(200, { attendance }, 'Today attendance'));
  } catch (e) { next(e); }
};

// ─── MY HISTORY (Employee) ────────────────────────────────────────────────────
export const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const employee = await Employee.findOne({ userId: req.user._id });

    const now    = new Date();
    const y      = Number(year  || now.getFullYear());
    const m      = Number(month || now.getMonth() + 1);
    const start  = new Date(y, m - 1, 1);
    const end    = new Date(y, m,     0, 23, 59, 59);

    const records = await Attendance.find({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    res.status(200).json(new ApiResponse(200, { records }, 'Attendance history'));
  } catch (e) { next(e); }
};

// ─── ALL ATTENDANCE (Admin) ───────────────────────────────────────────────────
export const getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, page = 1, limit = 20 } = req.query;

    const matchDate = date ? new Date(date) : new Date();
    const query = {
      date: { $gte: startOfDay(new Date(matchDate)), $lte: endOfDay(new Date(matchDate)) },
    };

    if (department) {
      const empIds = await Employee.find({ department }).distinct('_id');
      query.employee = { $in: empIds };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .populate({ path: 'employee', select: 'firstName lastName employeeId profileImage', populate: { path: 'department', select: 'name' } })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(new ApiResponse(200, {
      records,
      pagination: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    }, 'All attendance'));
  } catch (e) { next(e); }
};

// ─── MARK ATTENDANCE (Admin) ──────────────────────────────────────────────────
export const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, note } = req.body;
    if (!employeeId || !date || !status) {
      return next(new ApiError(400, 'employeeId, date and status are required'));
    }

    const d = new Date(date);
    const attendance = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: { $gte: startOfDay(new Date(d)), $lte: endOfDay(new Date(d)) } },
      { employee: employeeId, date: startOfDay(new Date(d)), status, note, markedBy: req.user._id },
      { upsert: true, new: true }
    );

    res.status(200).json(new ApiResponse(200, { attendance }, 'Attendance marked'));
  } catch (e) { next(e); }
};

// ─── ATTENDANCE REPORT (Admin) ────────────────────────────────────────────────
export const getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (employeeId) query.employee = employeeId;

    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ date: -1 });

    // Summary stats
    const summary = {
      total:    records.length,
      present:  records.filter(r => r.status === 'present').length,
      absent:   records.filter(r => r.status === 'absent').length,
      late:     records.filter(r => r.status === 'late').length,
      halfDay:  records.filter(r => r.status === 'half_day').length,
    };

    res.status(200).json(new ApiResponse(200, { records, summary }, 'Attendance report'));
  } catch (e) { next(e); }
};
