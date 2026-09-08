import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import Department from '../models/Department.js';
import sendEmail from '../utils/sendEmail.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── GET ALL EMPLOYEES (Admin) ────────────────────────────────────────────────

export const getAllEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      status = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return next(new ApiError(400, 'Invalid department ID'));
      }

      query.department = department;
    }

    if (status) {
      const validStatuses = [
        'active',
        'inactive',
        'on_leave',
        'terminated',
      ];

      if (!validStatuses.includes(status)) {
        return next(new ApiError(400, 'Invalid employee status'));
      }

      query.status = status;
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('userId', 'email isActive lastLogin')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          employees,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
          },
        },
        'Employees fetched'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE EMPLOYEE ──────────────────────────────────────────────────────

export const getEmployee = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid employee ID'));
    }

    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name description')
      .populate('userId', 'email isActive lastLogin role');

    if (!employee) {
      return next(new ApiError(404, 'Employee not found'));
    }

    // Employees can only view their own profile
    if (req.user.role === 'employee') {
      const own = await Employee.findOne({ userId: req.user._id });

      if (!own || own._id.toString() !== employee._id.toString()) {
        return next(new ApiError(403, 'Access denied'));
      }
    }

    res.status(200).json(
      new ApiResponse(200, { employee }, 'Employee fetched')
    );
  } catch (error) {
    next(error);
  }
};

// ─── CREATE EMPLOYEE (Admin) ──────────────────────────────────────────────────

export const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      department,
      designation,
      salary,
      joiningDate,
      password = 'Employee@123',
    } = req.body;

    // ─── Basic validation ────────────────────────────────────────────────────

    if (!firstName?.trim()) {
      return next(new ApiError(400, 'First name is required'));
    }

    if (!lastName?.trim()) {
      return next(new ApiError(400, 'Last name is required'));
    }

    if (!email?.trim()) {
      return next(new ApiError(400, 'Email is required'));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return next(new ApiError(400, 'Enter a valid email address'));
    }

    if (!phone?.trim()) {
      return next(new ApiError(400, 'Phone number is required'));
    }

    if (!department) {
      return next(new ApiError(400, 'Department is required'));
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return next(new ApiError(400, 'Invalid department ID'));
    }

    if (!designation?.trim()) {
      return next(new ApiError(400, 'Designation is required'));
    }

    if (
      salary === undefined ||
      salary === null ||
      salary === ''
    ) {
      return next(new ApiError(400, 'Salary is required'));
    }

    const salaryNumber = Number(salary);

    if (
      Number.isNaN(salaryNumber) ||
      salaryNumber < 0
    ) {
      return next(
        new ApiError(400, 'Salary must be a valid positive number')
      );
    }

    if (!joiningDate) {
      return next(new ApiError(400, 'Joining date is required'));
    }

    const parsedJoiningDate = new Date(joiningDate);

    if (Number.isNaN(parsedJoiningDate.getTime())) {
      return next(new ApiError(400, 'Enter a valid joining date'));
    }

    // ─── Validate department ─────────────────────────────────────────────────

    const departmentExists = await Department.findById(department);

    if (!departmentExists) {
      return next(new ApiError(404, 'Department not found'));
    }

    // ─── Check duplicate email ────────────────────────────────────────────────

    const exists = await User.findOne({
      email: normalizedEmail,
    });

    if (exists) {
      return next(
        new ApiError(409, 'Email already registered')
      );
    }

    // ─── Create user account ──────────────────────────────────────────────────

    const user = await User.create({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: normalizedEmail,
      password,
      role: 'employee',
    });

    // ─── Create employee profile ──────────────────────────────────────────────

    let employee;

    try {
      employee = await Employee.create({
        userId: user._id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        address,
        department,
        designation: designation.trim(),
        salary: salaryNumber,
        joiningDate: parsedJoiningDate,
        profileImage: req.file
          ? `/uploads/${req.file.filename}`
          : '',
      });
    } catch (error) {
      // Cleanup user if employee creation fails
      await User.findByIdAndDelete(user._id);

      throw error;
    }

    // ─── Welcome email ────────────────────────────────────────────────────────

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to EMS — Your Account Details',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2 style="color:#4F46E5">
              Welcome to the Team, ${firstName.trim()}!
            </h2>

            <p>Your employee account has been created.</p>

            <div style="background:#F3F4F6;padding:16px;border-radius:8px;margin:16px 0">
              <p>
                <strong>Employee ID:</strong>
                ${employee.employeeId}
              </p>

              <p>
                <strong>Email:</strong>
                ${normalizedEmail}
              </p>

              <p>
                <strong>Password:</strong>
                ${password}
              </p>
            </div>

            <p style="color:#888;font-size:13px">
              Please change your password after first login.
            </p>
          </div>
        `,
      });
    } catch (_) {
      // Email failure should not block employee creation
    }

    const populated = await Employee.findById(employee._id)
      .populate('department', 'name');

    res.status(201).json(
      new ApiResponse(
        201,
        { employee: populated },
        'Employee created successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE EMPLOYEE (Admin) ──────────────────────────────────────────────────

export const updateEmployee = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid employee ID'));
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return next(new ApiError(404, 'Employee not found'));
    }

    // ─── Validate phone if changed ────────────────────────────────────────────

    if (req.body.phone !== undefined) {
      const phone = String(req.body.phone).trim();

      const phoneRegex = /^[6-9]\d{9}$/;

      if (!phoneRegex.test(phone)) {
        return next(
          new ApiError(400, 'Enter a valid 10-digit Indian phone number')
        );
      }

      employee.phone = phone;
    }

    // ─── Validate names if changed ───────────────────────────────────────────

    if (req.body.firstName !== undefined) {
      const firstName = String(req.body.firstName).trim();

      if (firstName.length < 2) {
        return next(
          new ApiError(400, 'First name must be at least 2 characters')
        );
      }

      employee.firstName = firstName;
    }

    if (req.body.lastName !== undefined) {
      const lastName = String(req.body.lastName).trim();

      if (lastName.length < 2) {
        return next(
          new ApiError(400, 'Last name must be at least 2 characters')
        );
      }

      employee.lastName = lastName;
    }

    // ─── Validate designation if changed ─────────────────────────────────────

    if (req.body.designation !== undefined) {
      const designation = String(req.body.designation).trim();

      if (!designation) {
        return next(
          new ApiError(400, 'Designation cannot be empty')
        );
      }

      employee.designation = designation;
    }

    // ─── Validate department if changed ──────────────────────────────────────

    if (req.body.department !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.body.department)) {
        return next(new ApiError(400, 'Invalid department ID'));
      }

      const departmentExists = await Department.findById(
        req.body.department
      );

      if (!departmentExists) {
        return next(new ApiError(404, 'Department not found'));
      }
    }

    // ─── Validate salary if changed ──────────────────────────────────────────

    if (req.body.salary !== undefined) {
      const salaryNumber = Number(req.body.salary);

      if (
        Number.isNaN(salaryNumber) ||
        salaryNumber < 0
      ) {
        return next(
          new ApiError(400, 'Salary must be a valid positive number')
        );
      }

      employee.salary = salaryNumber;
    }

    // ─── Validate status if changed ──────────────────────────────────────────

    if (req.body.status !== undefined) {
      const validStatuses = [
        'active',
        'inactive',
        'on_leave',
        'terminated',
      ];

      if (!validStatuses.includes(req.body.status)) {
        return next(new ApiError(400, 'Invalid employee status'));
      }
    }

    // ─── Validate joining date if changed ─────────────────────────────────────

    if (req.body.joiningDate !== undefined) {
      const date = new Date(req.body.joiningDate);

      if (Number.isNaN(date.getTime())) {
        return next(new ApiError(400, 'Enter a valid joining date'));
      }

      employee.joiningDate = date;
    }

    // ─── Profile image ────────────────────────────────────────────────────────

    if (req.file) {
      if (employee.profileImage) {
        const oldPath = path.join(
          'uploads',
          path.basename(employee.profileImage)
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      employee.profileImage = `/uploads/${req.file.filename}`;
    }

    await employee.save();

    // ─── Sync User account status ─────────────────────────────────────────────

    if (req.body.status !== undefined) {
      const userIsActive = ['active', 'on_leave'].includes(
        req.body.status
      );

      await User.findByIdAndUpdate(employee.userId, {
        isActive: userIsActive,
      });
    }

    // ─── Sync name on User model ──────────────────────────────────────────────

    if (
      req.body.firstName !== undefined ||
      req.body.lastName !== undefined
    ) {
      await User.findByIdAndUpdate(employee.userId, {
        name: `${employee.firstName} ${employee.lastName}`,
      });
    }

    const updated = await Employee.findById(employee._id)
      .populate('department', 'name');

    res.status(200).json(
      new ApiResponse(
        200,
        { employee: updated },
        'Employee updated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── DELETE EMPLOYEE (Admin — soft delete) ────────────────────────────────────

export const deleteEmployee = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid employee ID'));
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return next(new ApiError(404, 'Employee not found'));
    }

    // Soft delete
    employee.status = 'terminated';
    await employee.save();

    // Deactivate user account
    await User.findByIdAndUpdate(
      employee.userId,
      { isActive: false }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        'Employee terminated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD PROFILE IMAGE ─────────────────────────────────────────────────────

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No image provided'));
    }

    let employee;

    if (req.user.role === 'admin') {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ApiError(400, 'Invalid employee ID'));
      }

      employee = await Employee.findById(req.params.id);
    } else {
      employee = await Employee.findOne({
        userId: req.user._id,
      });
    }

    if (!employee) {
      return next(new ApiError(404, 'Employee not found'));
    }

    // Delete old file
    if (employee.profileImage) {
      const oldPath = path.join(
        'uploads',
        path.basename(employee.profileImage)
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    employee.profileImage = `/uploads/${req.file.filename}`;

    await employee.save();

    // Sync on User model
    await User.findByIdAndUpdate(employee.userId, {
      profileImage: employee.profileImage,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        { profileImage: employee.profileImage },
        'Profile image updated'
      )
    );
  } catch (error) {
    next(error);
  }
};