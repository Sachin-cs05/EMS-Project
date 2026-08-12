// ════════════════════════════════════════════════════════════════════════════
//  models/User.js
// ════════════════════════════════════════════════════════════════════════════
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      match:     [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: 6,
      select:    false,
    },
    role:         { type: String, enum: ['admin', 'employee'], default: 'employee' },
    profileImage: { type: String, default: '' },
    isActive:     { type: Boolean, default: true },
    lastLogin:    { type: Date },
    resetPasswordToken:   String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);


// ════════════════════════════════════════════════════════════════════════════
//  models/Employee.js
// ════════════════════════════════════════════════════════════════════════════

const employeeSchema = new mongoose.Schema(
  {
    employeeId:  { type: String, unique: true, uppercase: true },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    phone:       { type: String, required: true },
    address: {
      street:  String,
      city:    String,
      state:   String,
      zip:     String,
      country: { type: String, default: 'India' },
    },
    department:  { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true },
    salary:      { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
    profileImage:{ type: String, default: '' },
    status: {
      type:    String,
      enum:    ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
    },
    leaveBalance: {
      sick:    { type: Number, default: 12 },
      casual:  { type: Number, default: 12 },
      earned:  { type: Number, default: 15 },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model('Employee').countDocuments();
  this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  next();
});

export const Employee = mongoose.model('Employee', employeeSchema);


// ════════════════════════════════════════════════════════════════════════════
//  models/Department.js
// ════════════════════════════════════════════════════════════════════════════

const departmentSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, 'Department name is required'], unique: true, trim: true },
    description: { type: String, trim: true },
    head:        { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

departmentSchema.virtual('employeeCount', {
  ref:          'Employee',
  localField:   '_id',
  foreignField: 'department',
  count:        true,
});

export const Department = mongoose.model('Department', departmentSchema);


// ════════════════════════════════════════════════════════════════════════════
//  models/Attendance.js
// ════════════════════════════════════════════════════════════════════════════

const attendanceSchema = new mongoose.Schema(
  {
    employee:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date:      { type: Date, required: true },
    checkIn:   { type: Date, default: null },
    checkOut:  { type: Date, default: null },
    status: {
      type:    String,
      enum:    ['present', 'absent', 'late', 'half_day', 'holiday'],
      default: 'absent',
    },
    workHours: { type: Number, default: 0 },
    note:      { type: String, default: '' },
    markedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.workHours = Math.round(diff * 100) / 100;
    if (diff >= 8)       this.status = 'present';
    else if (diff >= 4)  this.status = 'half_day';
    else                 this.status = 'late';
  }
  next();
});

export const Attendance = mongoose.model('Attendance', attendanceSchema);


// ════════════════════════════════════════════════════════════════════════════
//  models/Leave.js
// ════════════════════════════════════════════════════════════════════════════

const leaveSchema = new mongoose.Schema(
  {
    employee:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, enum: ['sick', 'casual', 'earned'], required: true },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    totalDays: { type: Number },
    reason:    { type: String, required: [true, 'Reason is required'], minlength: 10 },
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNote: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    this.totalDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

export const Leave = mongoose.model('Leave', leaveSchema);


// ════════════════════════════════════════════════════════════════════════════
//  models/Notification.js
// ════════════════════════════════════════════════════════════════════════════

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    type: {
      type:    String,
      enum:    ['leave_approved', 'leave_rejected', 'leave_applied', 'attendance', 'system', 'general'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
    link:   { type: String, default: '' },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
