# 🏢 EMS Pro — Employee Management System
### Production-ready MERN Stack Application

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Local-brightgreen) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-cyan) ![Redux](https://img.shields.io/badge/Redux-Toolkit-purple)

---

## ✨ Features

| Module | Features |
|--------|----------|
| **Auth** | JWT login/logout, RBAC (Admin/Employee), forgot/reset password via email |
| **Employees** | Full CRUD, profile image upload, search, filter, pagination |
| **Departments** | Create, edit, delete with employee count |
| **Attendance** | Check-in/out, daily records, admin mark, work hours calc |
| **Leaves** | Apply, approve, reject, cancel; leave balance deduction |
| **Dashboard** | Live stats, 4 interactive Recharts, recent activity |
| **Analytics** | Growth, department pie, attendance trend, leave breakdown |
| **Notifications** | In-app + email via Nodemailer |
| **UI/UX** | Dark/Light mode, glassmorphism, Framer Motion, fully responsive |

---

## 🗂 Project Structure

```
ems-project/
├── backend/          Express API
│   ├── config/       MongoDB connection
│   ├── controllers/  Business logic
│   ├── middleware/   Auth, RBAC, upload, error handler
│   ├── models/       Mongoose schemas
│   ├── routes/       Express routers
│   └── utils/        JWT, email, seed script, API helpers
└── frontend/         React + Vite SPA
    └── src/
        ├── api/      Axios instance + all API calls
        ├── app/      Redux store
        ├── components/  Reusable UI (layout, charts, common)
        ├── features/    Redux slices
        ├── hooks/       Custom hooks
        ├── pages/       All page components (admin + employee)
        └── routes/      AppRouter + guards
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Community Server running locally
- Gmail account (for email features)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your local MongoDB URI and email credentials

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure `.env` (backend)

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ems_db
JWT_SECRET=your_very_long_random_secret_key
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,https://your-frontend-domain.vercel.app
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password   # Gmail → Settings → App Passwords
ADMIN_EMAIL=admin@ems.com
ADMIN_PASSWORD=Admin@123
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 5 departments (Engineering, HR, Finance, Marketing, Operations)
- 1 admin account: `admin@ems.com / Admin@123`
- 8 employee accounts, demo login: `emp@ems.com / Emp@123`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev       # starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173` and login!

---

## 🌐 Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create new **Web Service** on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from `.env`
6. Deploy — note your Render URL (e.g. `https://ems-api.onrender.com`)

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import project on Vercel
3. Set environment variable: `VITE_API_URL=https://ems-api.onrender.com/api/v1`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

### Local MongoDB Setup

1. Install MongoDB Community Server
2. Start the MongoDB service on your machine
3. Keep `MONGODB_URI=mongodb://127.0.0.1:27017/ems_db` in `backend/.env`
4. Run `npm run seed` from `backend/` to create initial data

---

## 🔑 API Reference

### Base URL: `/api/v1`

#### Auth
```
POST   /auth/login             → { token, user, employee }
GET    /auth/me                → current user profile
POST   /auth/logout
PUT    /auth/change-password
POST   /auth/forgot-password
PUT    /auth/reset-password/:token
```

#### Employees (Admin)
```
GET    /employees              → list (search, filter, paginate)
POST   /employees              → create (multipart/form-data)
GET    /employees/:id          → get one
PUT    /employees/:id          → update
DELETE /employees/:id          → soft delete (terminated)
PUT    /employees/:id/profile-image
```

#### Attendance
```
POST   /attendance/check-in    → employee check-in
PUT    /attendance/check-out   → employee check-out
GET    /attendance/today       → today's record
GET    /attendance/my-history  → ?month=&year=
GET    /attendance             → admin: all records
POST   /attendance/mark        → admin: mark for employee
GET    /attendance/report      → admin: report
```

#### Leaves
```
POST   /leaves/apply           → employee apply
GET    /leaves/my-leaves       → employee history
PUT    /leaves/:id/cancel      → employee cancel
GET    /leaves                 → admin: all (?status=pending)
PUT    /leaves/:id/approve     → admin
PUT    /leaves/:id/reject      → admin (+ note)
```

#### Dashboard (Admin)
```
GET    /dashboard/stats        → totals + today attendance
GET    /dashboard/charts       → growth, dept, attendance, leave data
GET    /dashboard/recent-activity
```

#### Notifications
```
GET    /notifications          → list + unread count
PUT    /notifications/:id/read
PUT    /notifications/read-all
```

---

## 🎨 Design System

All UI tokens are defined in `tailwind.config.js` and `index.css`:

| Token | Value |
|-------|-------|
| Primary | Indigo `#6366f1` |
| Success | Emerald `#10b981` |
| Warning | Amber `#f59e0b` |
| Danger  | Red `#ef4444` |
| Font    | Inter (Google Fonts) |
| Radius  | `rounded-2xl` (cards), `rounded-xl` (inputs) |

Key CSS utility classes:
- `.card` — white/dark card with border + shadow
- `.stat-card` — hover-lift stat card
- `.btn-primary / .btn-secondary / .btn-danger / .btn-ghost`
- `.input / .select / .input-error`
- `.data-table` — styled table
- `.badge / .badge-green / .badge-red` etc.
- `.nav-item / .nav-item.active` — sidebar links

---

## 🏗 Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| JWT in localStorage | Simple for SPA; swap to httpOnly cookie for enhanced security |
| Soft delete (terminated) | Preserves data integrity and audit trail |
| Redux Toolkit | Best-in-class DX with less boilerplate than vanilla Redux |
| Framer Motion | Polished animations without complexity |
| Recharts | Composable, React-native charting |
| Multer local storage | Simple; swap to S3/Cloudinary for production scale |
| Mongoose virtuals | `fullName`, `employeeCount` computed without redundant DB writes |

---

## 📁 Key Files Quick Reference

| File | Purpose |
|------|---------|
| `backend/server.js` | Express app entry point |
| `backend/config/db.js` | MongoDB Atlas connection |
| `backend/middleware/authMiddleware.js` | JWT verify + RBAC guards |
| `backend/controllers/authController.js` | Login, logout, password reset |
| `backend/controllers/employeeController.js` | Full employee CRUD |
| `backend/utils/seedAdmin.js` | DB seeder — run once |
| `frontend/src/app/store.js` | Redux store |
| `frontend/src/features/slices.js` | All Redux slices |
| `frontend/src/api/index.js` | All Axios API calls |
| `frontend/src/routes/AppRouter.jsx` | Route definitions |
| `frontend/src/index.css` | Tailwind + design system |
| `frontend/src/pages/auth/LoginPage.jsx` | Login UI |
| `frontend/src/pages/admin/AdminDashboard.jsx` | Admin dashboard |

---

## 📧 Email Setup (Gmail)

1. Go to Google Account → Security → 2-Step Verification (enable it)
2. Go to Security → App Passwords
3. Generate a new app password for "Mail"
4. Use that 16-character password as `EMAIL_PASS` in `.env`

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] JWT signed with secret, expires in 7 days
- [x] Role-based access control on every route
- [x] MongoDB injection protection via Mongoose
- [x] File upload type/size validation
- [x] Global error handler (no stack traces in production)
- [x] CORS restricted to `CLIENT_URL` / `CLIENT_URLS`
- [ ] Rate limiting (add `express-rate-limit` for production)
- [ ] Helmet.js headers (add for production)
- [ ] HTTPS only (enforced by Vercel/Render automatically)

---

## 📜 License

MIT — Free for portfolio and commercial use.

---

**Built with ❤️ using React 18 · Node.js · MongoDB Atlas · Redux Toolkit · Tailwind CSS**
# EMS-Project
