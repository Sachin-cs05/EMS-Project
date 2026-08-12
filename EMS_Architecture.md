# Employee Management System — Architecture Reference

## Complete Folder Structure

```
ems-project/
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB Atlas connection
│   │   └── cloudinary.js            # (optional) Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── departmentController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   ├── notificationController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── roleMiddleware.js        # RBAC: isAdmin, isEmployee
│   │   ├── uploadMiddleware.js      # Multer config
│   │   └── errorHandler.js         # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Department.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── generateToken.js         # JWT generator
│   │   ├── sendEmail.js             # Nodemailer helper
│   │   ├── ApiError.js              # Custom error class
│   │   └── ApiResponse.js           # Standardized response
│   ├── uploads/                     # Local image storage
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js                    # Entry point
│
└── frontend/
    ├── public/
    │   └── logo.svg
    ├── src/
    │   ├── api/
    │   │   ├── axiosInstance.js      # Axios base instance + interceptors
    │   │   ├── authApi.js
    │   │   ├── employeeApi.js
    │   │   ├── departmentApi.js
    │   │   ├── attendanceApi.js
    │   │   ├── leaveApi.js
    │   │   └── dashboardApi.js
    │   ├── app/
    │   │   └── store.js              # Redux store
    │   ├── assets/
    │   │   └── images/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Button.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Select.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Table.jsx
    │   │   │   ├── Pagination.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   ├── Avatar.jsx
    │   │   │   ├── Skeleton.jsx
    │   │   │   ├── EmptyState.jsx
    │   │   │   ├── ConfirmDialog.jsx
    │   │   │   └── Toast.jsx
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── DashboardLayout.jsx
    │   │   │   └── AuthLayout.jsx
    │   │   ├── dashboard/
    │   │   │   ├── StatCard.jsx
    │   │   │   ├── RecentActivity.jsx
    │   │   │   └── QuickActions.jsx
    │   │   ├── charts/
    │   │   │   ├── DepartmentPieChart.jsx
    │   │   │   ├── AttendanceTrendChart.jsx
    │   │   │   ├── LeaveStatsChart.jsx
    │   │   │   └── EmployeeGrowthChart.jsx
    │   │   └── employee/
    │   │       ├── EmployeeCard.jsx
    │   │       ├── EmployeeForm.jsx
    │   │       └── EmployeeFilter.jsx
    │   ├── features/
    │   │   ├── auth/
    │   │   │   └── authSlice.js
    │   │   ├── employee/
    │   │   │   └── employeeSlice.js
    │   │   ├── department/
    │   │   │   └── departmentSlice.js
    │   │   ├── attendance/
    │   │   │   └── attendanceSlice.js
    │   │   ├── leave/
    │   │   │   └── leaveSlice.js
    │   │   └── notification/
    │   │       └── notificationSlice.js
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useToast.js
    │   │   └── useDebounce.js
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── ForgotPasswordPage.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── EmployeeList.jsx
    │   │   │   ├── EmployeeProfile.jsx
    │   │   │   ├── AddEmployee.jsx
    │   │   │   ├── EditEmployee.jsx
    │   │   │   ├── DepartmentList.jsx
    │   │   │   ├── AttendanceManagement.jsx
    │   │   │   ├── LeaveManagement.jsx
    │   │   │   └── Analytics.jsx
    │   │   └── employee/
    │   │       ├── EmployeeDashboard.jsx
    │   │       ├── MyProfile.jsx
    │   │       ├── MyAttendance.jsx
    │   │       ├── ApplyLeave.jsx
    │   │       └── LeaveHistory.jsx
    │   ├── routes/
    │   │   ├── AppRouter.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── AdminRoute.jsx
    │   ├── utils/
    │   │   ├── constants.js
    │   │   ├── formatDate.js
    │   │   └── validators.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css               # Tailwind directives
    ├── .env
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## MongoDB Schemas

### 1. User Schema (`models/User.js`)

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
```

---

### 2. Employee Schema (`models/Employee.js`)

```javascript
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Auto-generated: EMP-0001
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: { type: String, required: true },
    address: {
      street: String,
      city:   String,
      state:  String,
      zip:    String,
      country: { type: String, default: 'India' },
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: { type: String, required: true },
    salary: { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
    profileImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
    },
    leaveBalance: {
      sick:    { type: Number, default: 12 },
      casual:  { type: Number, default: 12 },
      earned:  { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

// Virtual: full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Auto-generate employeeId
employeeSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model('Employee').countDocuments();
  this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  next();
});

export default mongoose.model('Employee', employeeSchema);
```

---

### 3. Department Schema (`models/Department.js`)

```javascript
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    description: { type: String, trim: true },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: employee count
departmentSchema.virtual('employeeCount', {
  ref:          'Employee',
  localField:   '_id',
  foreignField: 'department',
  count:        true,
});

export default mongoose.model('Department', departmentSchema);
```

---

### 4. Attendance Schema (`models/Attendance.js`)

```javascript
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'holiday'],
      default: 'absent',
    },
    workHours: { type: Number, default: 0 },   // Computed on checkOut
    note: { type: String, default: '' },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = self; ObjectId = admin
    },
  },
  { timestamps: true }
);

// Unique attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Auto-calculate work hours on checkOut
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

export default mongoose.model('Attendance', attendanceSchema);
```

---

### 5. Leave Schema (`models/Leave.js`)

```javascript
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'earned'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    totalDays: { type: Number },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      minlength: 10,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNote:  { type: String, default: '' },
    reviewedAt:  { type: Date },
  },
  { timestamps: true }
);

// Calculate total days
leaveSchema.pre('save', function (next) {
  const msPerDay = 1000 * 60 * 60 * 24;
  this.totalDays = Math.ceil((this.endDate - this.startDate) / msPerDay) + 1;
  next();
});

export default mongoose.model('Leave', leaveSchema);
```

---

### 6. Notification Schema (`models/Notification.js`)

```javascript
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['leave_approved', 'leave_rejected', 'leave_applied', 'attendance', 'system', 'general'],
      default: 'general',
    },
    isRead: { type: Boolean, default: false },
    link:   { type: String, default: '' }, // Optional deep link
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
```

---

## API Architecture

### Base URL
```
/api/v1
```

### Auth Routes (`/api/v1/auth`)
| Method | Endpoint             | Access  | Description               |
|--------|----------------------|---------|---------------------------|
| POST   | /login               | Public  | Login, returns JWT         |
| POST   | /logout              | Private | Clear token / blacklist    |
| GET    | /me                  | Private | Get current user profile   |
| PUT    | /change-password     | Private | Change own password        |
| POST   | /forgot-password     | Public  | Send reset email           |
| PUT    | /reset-password/:token | Public | Reset password via token  |

### Employee Routes (`/api/v1/employees`)
| Method | Endpoint          | Access | Description                           |
|--------|-------------------|--------|---------------------------------------|
| GET    | /                 | Admin  | List all employees (search, filter, paginate) |
| POST   | /                 | Admin  | Create new employee + user account    |
| GET    | /:id              | Both   | Get single employee (admin: any, employee: own) |
| PUT    | /:id              | Admin  | Update employee                       |
| DELETE | /:id              | Admin  | Delete (soft delete: status=terminated)|
| PUT    | /:id/profile-image| Both   | Upload profile image                  |

### Department Routes (`/api/v1/departments`)
| Method | Endpoint | Access | Description              |
|--------|----------|--------|--------------------------|
| GET    | /        | Both   | List all departments     |
| POST   | /        | Admin  | Create department        |
| PUT    | /:id     | Admin  | Update department        |
| DELETE | /:id     | Admin  | Delete department        |

### Attendance Routes (`/api/v1/attendance`)
| Method | Endpoint           | Access   | Description                        |
|--------|--------------------|----------|------------------------------------|
| POST   | /check-in          | Employee | Mark check-in                      |
| PUT    | /check-out         | Employee | Mark check-out                     |
| GET    | /today             | Employee | Get today's attendance              |
| GET    | /my-history        | Employee | Personal attendance history         |
| GET    | /                  | Admin    | All attendance (date filter)        |
| POST   | /mark              | Admin    | Mark attendance for an employee     |
| GET    | /report            | Admin    | Attendance report (CSV/JSON)        |

### Leave Routes (`/api/v1/leaves`)
| Method | Endpoint       | Access   | Description                          |
|--------|----------------|----------|--------------------------------------|
| POST   | /apply         | Employee | Apply for leave                      |
| GET    | /my-leaves     | Employee | My leave history                     |
| PUT    | /:id/cancel    | Employee | Cancel pending leave                 |
| GET    | /              | Admin    | All leave requests                   |
| PUT    | /:id/approve   | Admin    | Approve leave                        |
| PUT    | /:id/reject    | Admin    | Reject leave                         |

### Dashboard Routes (`/api/v1/dashboard`)
| Method | Endpoint         | Access | Description                              |
|--------|------------------|--------|------------------------------------------|
| GET    | /stats           | Admin  | Total employees, departments, etc.        |
| GET    | /charts          | Admin  | Data for all charts                      |
| GET    | /recent-activity | Admin  | Recent hires, leaves, attendance          |

### Notification Routes (`/api/v1/notifications`)
| Method | Endpoint     | Access  | Description                  |
|--------|--------------|---------|------------------------------|
| GET    | /            | Private | Get all my notifications     |
| PUT    | /:id/read    | Private | Mark notification as read     |
| PUT    | /read-all    | Private | Mark all as read              |

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ems_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Nodemailer (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password

# Default admin seed
ADMIN_EMAIL=admin@ems.com
ADMIN_PASSWORD=Admin@123
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Standardized API Response Pattern

### `utils/ApiResponse.js`
```javascript
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data       = data;
    this.message    = message;
    this.success    = statusCode < 400;
  }
}
export default ApiResponse;
```

### `utils/ApiError.js`
```javascript
class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data       = null;
    this.success    = false;
    this.errors     = errors;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}
export default ApiError;
```

---

## Deployment Guide

### Prerequisites
- MongoDB Atlas cluster (free tier works)
- Node.js 18+
- Vercel account (frontend)
- Render account (backend)

### Step 1 — Backend (Render)
```bash
# In /backend
npm install
# Set all environment variables in Render dashboard
# Build command: npm install
# Start command: node server.js
```

### Step 2 — Frontend (Vercel)
```bash
# In /frontend
npm install
npm run build
# Set VITE_API_URL=https://your-render-backend.onrender.com/api/v1
# Deploy dist/ folder to Vercel
```

### Step 3 — Seed Admin User
```bash
# Add this to backend/utils/seedAdmin.js and run once
node utils/seedAdmin.js
```

### CORS Configuration
```javascript
// In server.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
```
