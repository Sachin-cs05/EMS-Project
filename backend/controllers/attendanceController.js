import Attendance from '../models/Attendance.js';
import Employee   from '../models/Employee.js';
import mongoose   from 'mongoose';
import ApiError   from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { createNotificationSafely } from '../utils/notificationService.js';

const startOfDay = (d = new Date()) => new Date(d.setHours(0,  0,  0, 0));
const endOfDay   = (d = new Date()) => new Date(d.setHours(23, 59, 59, 999));

// ─── CHECK-IN (Employee) ──────────────────────────────────────────────────────
export const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return next(
        new ApiError(404, 'Employee profile not found')
      );
    }

    if (employee.status !== 'active') {
      return next(
        new ApiError(400, 'Only active employees can check in')
      );
    }

    const now = new Date();

    const dayStart = startOfDay(new Date(now));
    const dayEnd = endOfDay(new Date(now));

    const existing = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: dayStart,
        $lte: dayEnd,
      },
    });

    if (existing?.checkIn) {
      return next(
        new ApiError(400, 'Already checked in today')
      );
    }

    // 9:30 AM ke baad check-in = late
    const hour = now.getHours();
    const minute = now.getMinutes();

    const isLate =
      hour > 9 || (hour === 9 && minute > 30);

    let attendance;

    if (existing) {
      existing.checkIn = now;
      existing.status = isLate ? 'late' : 'present';
      existing.markedBy = null;

      attendance = await existing.save();
    } else {
      attendance = await Attendance.create({
        employee: employee._id,
        date: dayStart,
        checkIn: now,
        status: isLate ? 'late' : 'present',
      });
    }

    res.status(200).json(
      new ApiResponse(
        200,
        { attendance },
        isLate
          ? 'Check-in recorded. You are late today.'
          : 'Check-in recorded successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── CHECK-OUT (Employee) ─────────────────────────────────────────────────────
export const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return next(
        new ApiError(404, 'Employee profile not found')
      );
    }

    if (employee.status !== 'active') {
      return next(
        new ApiError(400, 'Only active employees can check out')
      );
    }

    const now = new Date();

    const dayStart = startOfDay(new Date(now));
    const dayEnd = endOfDay(new Date(now));

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: dayStart,
        $lte: dayEnd,
      },
    });

    if (!attendance) {
      return next(
        new ApiError(
          400,
          'No attendance record found for today. Please check in first'
        )
      );
    }

    if (!attendance.checkIn) {
      return next(
        new ApiError(400, 'Please check in first')
      );
    }

    if (attendance.checkOut) {
      return next(
        new ApiError(400, 'Already checked out today')
      );
    }

    if (now <= attendance.checkIn) {
      return next(
        new ApiError(
          400,
          'Check-out time must be after check-in time'
        )
      );
    }

    attendance.checkOut = now;

    // Work hours will be calculated by Attendance pre-save hook
    await attendance.save();

    res.status(200).json(
      new ApiResponse(
        200,
        { attendance },
        'Check-out recorded successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET TODAY (Employee) ─────────────────────────────────────────────────────
export const getTodayAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return next(
        new ApiError(404, 'Employee profile not found')
      );
    }

    const today = new Date();

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: startOfDay(new Date(today)),
        $lte: endOfDay(new Date(today)),
      },
    }).populate(
      'employee',
      'firstName lastName employeeId profileImage designation'
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          attendance,
          hasCheckedIn: Boolean(attendance?.checkIn),
          hasCheckedOut: Boolean(attendance?.checkOut),
          workHours: attendance?.workHours || 0,
        },
        'Today attendance fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── MY HISTORY (Employee) ────────────────────────────────────────────────────
export const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const employee = await Employee.findOne({
      userId: req.user._id,
    });

    if (!employee) {
      return next(
        new ApiError(404, 'Employee profile not found')
      );
    }

    const now = new Date();

    const selectedYear = Number(
      year || now.getFullYear()
    );

    const selectedMonth = Number(
      month || now.getMonth() + 1
    );

    if (
      selectedMonth < 1 ||
      selectedMonth > 12 ||
      selectedYear < 2000 ||
      selectedYear > 2100
    ) {
      return next(
        new ApiError(400, 'Invalid month or year')
      );
    }

    const start = new Date(
      selectedYear,
      selectedMonth - 1,
      1,
      0,
      0,
      0,
      0
    );

    const end = new Date(
      selectedYear,
      selectedMonth,
      0,
      23,
      59,
      59,
      999
    );

    const records = await Attendance.find({
      employee: employee._id,
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({ date: -1 })
      .lean();

    const summary = {
      total: records.length,
      present: records.filter(
        (record) => record.status === 'present'
      ).length,
      late: records.filter(
        (record) => record.status === 'late'
      ).length,
      halfDay: records.filter(
        (record) => record.status === 'half_day'
      ).length,
      absent: records.filter(
        (record) => record.status === 'absent'
      ).length,
      holiday: records.filter(
        (record) => record.status === 'holiday'
      ).length,
      totalWorkHours: Math.round(
        records.reduce(
          (total, record) =>
            total + (record.workHours || 0),
          0
        ) * 100
      ) / 100,
    };

    res.status(200).json(
      new ApiResponse(
        200,
        {
          records,
          summary,
          month: selectedMonth,
          year: selectedYear,
        },
        'Attendance history fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── ALL ATTENDANCE (Admin) ───────────────────────────────────────────────────
export const getAllAttendance = async (req, res, next) => {
  try {
    const {
      date,
      department,
      status,
      search = '',
      page = 1,
      limit = 20,
    } = req.query;

    const matchDate = date ? new Date(date) : new Date();

    if (Number.isNaN(matchDate.getTime())) {
      return next(
        new ApiError(400, 'Invalid date')
      );
    }

    const query = {
      date: {
        $gte: startOfDay(new Date(matchDate)),
        $lte: endOfDay(new Date(matchDate)),
      },
    };

    if (department) {
      const employeeIds = await Employee.find({
        department,
      }).distinct('_id');

      query.employee = {
        $in: employeeIds,
      };
    }

    if (status) {
      query.status = status;
    }

    if (search.trim()) {
      const searchRegex = {
        $regex: search.trim(),
        $options: 'i',
      };

      const employeeIds = await Employee.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { employeeId: searchRegex },
          { email: searchRegex },
        ],
      }).distinct('_id');

      query.employee = query.employee
        ? {
            $in: employeeIds.filter((id) =>
              query.employee.$in.some(
                (existingId) =>
                  existingId.toString() === id.toString()
              )
            ),
          }
        : {
            $in: employeeIds,
          };
    }

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const total =
      await Attendance.countDocuments(query);

    const records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select:
          'firstName lastName employeeId profileImage designation department',
        populate: {
          path: 'department',
          select: 'name',
        },
      })
      .populate(
        'markedBy',
        'name email'
      )
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const summary = {
      total,
      present: records.filter(
        (record) =>
          record.status === 'present'
      ).length,
      late: records.filter(
        (record) =>
          record.status === 'late'
      ).length,
      halfDay: records.filter(
        (record) =>
          record.status === 'half_day'
      ).length,
      absent: records.filter(
        (record) =>
          record.status === 'absent'
      ).length,
      holiday: records.filter(
        (record) =>
          record.status === 'holiday'
      ).length,
    };

    res.status(200).json(
      new ApiResponse(
        200,
        {
          records,
          summary,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(
              total / limitNumber
            ),
          },
        },
        'Attendance records fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── MARK ATTENDANCE (Admin) ──────────────────────────────────────────────────
export const markAttendance = async (req, res, next) => {
  try {
    const {
      employeeId,
      date,
      status,
      note = '',
    } = req.body;

    if (!employeeId || !date || !status) {
      return next(
        new ApiError(
          400,
          'employeeId, date and status are required'
        )
      );
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return next(new ApiError(400, 'Invalid employee ID'));
    }

    const allowedStatuses = [
      'present',
      'absent',
      'late',
      'half_day',
      'holiday',
    ];

    if (!allowedStatuses.includes(status)) {
      return next(
        new ApiError(400, 'Invalid attendance status')
      );
    }

    const employee = await Employee.findById(
      employeeId
    );

    if (!employee) {
      return next(
        new ApiError(404, 'Employee not found')
      );
    }

    const attendanceDate = new Date(date);

    if (Number.isNaN(attendanceDate.getTime())) {
      return next(
        new ApiError(400, 'Invalid attendance date')
      );
    }

    // Prevent marking attendance for future dates
    const today = startOfDay(new Date());

    if (startOfDay(new Date(attendanceDate)) > today) {
      return next(
        new ApiError(
          400,
          'Attendance cannot be marked for a future date'
        )
      );
    }

    const dayStart = startOfDay(
      new Date(attendanceDate)
    );

    const dayEnd = endOfDay(
      new Date(attendanceDate)
    );

    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: dayStart,
        $lte: dayEnd,
      },
    });

    const normalizedNote = note.trim();
    const attendanceChanged = !attendance ||
      attendance.status !== status ||
      attendance.note !== normalizedNote;

    if (attendance) {
      attendance.status = status;
      attendance.note = normalizedNote;
      attendance.markedBy = req.user._id;

      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employee._id,
        date: dayStart,
        status,
        note: normalizedNote,
        markedBy: req.user._id,
      });
    }

    if (attendanceChanged) {
      await createNotificationSafely({
        recipient: employee.userId,
        title: 'Attendance Updated',
        message: `Your attendance for ${dayStart.toLocaleDateString()} has been marked as ${status.replace('_', ' ')}.${normalizedNote ? ` Note: ${normalizedNote}` : ''}`,
        type: 'attendance',
        link: '/employee/attendance',
      });
    }

    const populatedAttendance =
      await Attendance.findById(attendance._id)
        .populate({
          path: 'employee',
          select:
            'firstName lastName employeeId profileImage designation department',
          populate: {
            path: 'department',
            select: 'name',
          },
        })
        .populate(
          'markedBy',
          'name email'
        );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          attendance: populatedAttendance,
        },
        'Attendance marked successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── ATTENDANCE REPORT (Admin) ────────────────────────────────────────────────
export const getAttendanceReport = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      employeeId,
      department,
      status,
    } = req.query;

    const query = {};

    if (startDate || endDate) {
      const start = startDate
        ? new Date(startDate)
        : new Date('2000-01-01');

      const end = endDate
        ? new Date(endDate)
        : new Date();

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return next(
          new ApiError(400, 'Invalid date range')
        );
      }

      query.date = {
        $gte: startOfDay(start),
        $lte: endOfDay(end),
      };
    }

    if (employeeId) {
      const employee = await Employee.findById(
        employeeId
      );

      if (!employee) {
        return next(
          new ApiError(404, 'Employee not found')
        );
      }

      query.employee = employee._id;
    }

    if (department) {
      const employeeIds = await Employee.find({
        department,
      }).distinct('_id');

      query.employee = {
        $in: employeeIds,
      };
    }

    if (status) {
      const allowedStatuses = [
        'present',
        'absent',
        'late',
        'half_day',
        'holiday',
      ];

      if (!allowedStatuses.includes(status)) {
        return next(
          new ApiError(
            400,
            'Invalid attendance status'
          )
        );
      }

      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select:
          'firstName lastName employeeId designation department',
        populate: {
          path: 'department',
          select: 'name',
        },
      })
      .populate(
        'markedBy',
        'name email'
      )
      .sort({ date: -1 })
      .lean();

    const summary = {
      total: records.length,

      present: records.filter(
        (record) =>
          record.status === 'present'
      ).length,

      absent: records.filter(
        (record) =>
          record.status === 'absent'
      ).length,

      late: records.filter(
        (record) =>
          record.status === 'late'
      ).length,

      halfDay: records.filter(
        (record) =>
          record.status === 'half_day'
      ).length,

      holiday: records.filter(
        (record) =>
          record.status === 'holiday'
      ).length,

      totalWorkHours: Math.round(
        records.reduce(
          (total, record) =>
            total + (record.workHours || 0),
          0
        ) * 100
      ) / 100,
    };

    const attendancePercentage =
      summary.total > 0
        ? Math.round(
            ((summary.present + summary.late) /
              summary.total) *
              10000
          ) / 100
        : 0;

    summary.attendancePercentage =
      attendancePercentage;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          records,
          summary,
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
            employeeId: employeeId || null,
            department: department || null,
            status: status || null,
          },
        },
        'Attendance report generated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};
