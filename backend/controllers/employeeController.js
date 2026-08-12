import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import sendEmail from '../utils/sendEmail.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── GET ALL EMPLOYEES (Admin) ────────────────────────────────────────────────
export const getAllEmployees = async (req, res, next) => {
  try {
    const {
      page       = 1,
      limit      = 10,
      search     = '',
      department = '',
      status     = '',
      sortBy     = 'createdAt',
      order      = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName:   { $regex: search, $options: 'i' } },
        { lastName:    { $regex: search, $options: 'i' } },
        { email:       { $regex: search, $options: 'i' } },
        { employeeId:  { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;
    if (status)     query.status     = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('userId', 'email isActive lastLogin')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json(
      new ApiResponse(200, {
        employees,
        pagination: {
          total,
          page:       Number(page),
          limit:      Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      }, 'Employees fetched')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE EMPLOYEE ──────────────────────────────────────────────────────
export const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name description')
      .populate('userId', 'email isActive lastLogin role');

    if (!employee) return next(new ApiError(404, 'Employee not found'));

    // Employees can only view their own profile
    if (req.user.role === 'employee') {
      const own = await Employee.findOne({ userId: req.user._id });
      if (!own || own._id.toString() !== employee._id.toString()) {
        return next(new ApiError(403, 'Access denied'));
      }
    }

    res.status(200).json(new ApiResponse(200, { employee }, 'Employee fetched'));
  } catch (error) {
    next(error);
  }
};

// ─── CREATE EMPLOYEE (Admin) ──────────────────────────────────────────────────
export const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, address,
      department, designation, salary, joiningDate,
      password = 'Employee@123',
    } = req.body;

    // Check duplicate
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return next(new ApiError(400, 'Email already registered'));

    // Create user account
    const user = await User.create({
      name:  `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password,
      role:  'employee',
    });

    // Create employee profile
    const employee = await Employee.create({
      userId: user._id,
      firstName,
      lastName,
      email:  email.toLowerCase(),
      phone,
      address,
      department,
      designation,
      salary,
      joiningDate,
      profileImage: req.file
        ? `/uploads/${req.file.filename}`
        : '',
    });

    // Welcome email
    try {
      await sendEmail({
        to:      email,
        subject: 'Welcome to EMS — Your Account Details',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2 style="color:#4F46E5">Welcome to the Team, ${firstName}!</h2>
            <p>Your employee account has been created.</p>
            <div style="background:#F3F4F6;padding:16px;border-radius:8px;margin:16px 0">
              <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            <p style="color:#888;font-size:13px">Please change your password after first login.</p>
          </div>
        `,
      });
    } catch (_) {
      // Email failure shouldn't block creation
    }

    const populated = await Employee.findById(employee._id)
      .populate('department', 'name');

    res.status(201).json(
      new ApiResponse(201, { employee: populated }, 'Employee created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE EMPLOYEE (Admin) ──────────────────────────────────────────────────
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return next(new ApiError(404, 'Employee not found'));

    const allowed = [
      'firstName', 'lastName', 'phone', 'address',
      'department', 'designation', 'salary', 'joiningDate', 'status',
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    if (req.file) {
      // Delete old image
      if (employee.profileImage) {
        const oldPath = path.join('uploads', path.basename(employee.profileImage));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      employee.profileImage = `/uploads/${req.file.filename}`;
    }

    await employee.save();

    // Sync name on User model if name changed
    if (req.body.firstName || req.body.lastName) {
      await User.findByIdAndUpdate(employee.userId, {
        name: `${employee.firstName} ${employee.lastName}`,
      });
    }

    const updated = await Employee.findById(employee._id)
      .populate('department', 'name');

    res.status(200).json(
      new ApiResponse(200, { employee: updated }, 'Employee updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── DELETE EMPLOYEE (Admin — soft delete) ────────────────────────────────────
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return next(new ApiError(404, 'Employee not found'));

    // Soft delete
    employee.status = 'terminated';
    await employee.save();

    // Deactivate user account
    await User.findByIdAndUpdate(employee.userId, { isActive: false });

    res.status(200).json(
      new ApiResponse(200, null, 'Employee terminated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD PROFILE IMAGE ─────────────────────────────────────────────────────
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, 'No image provided'));

    let employee;
    if (req.user.role === 'admin') {
      employee = await Employee.findById(req.params.id);
    } else {
      employee = await Employee.findOne({ userId: req.user._id });
    }

    if (!employee) return next(new ApiError(404, 'Employee not found'));

    // Delete old file
    if (employee.profileImage) {
      const oldPath = path.join('uploads', path.basename(employee.profileImage));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    employee.profileImage = `/uploads/${req.file.filename}`;
    await employee.save();

    // Sync on User model
    await User.findByIdAndUpdate(employee.userId, {
      profileImage: employee.profileImage,
    });

    res.status(200).json(
      new ApiResponse(200, { profileImage: employee.profileImage }, 'Profile image updated')
    );
  } catch (error) {
    next(error);
  }
};
