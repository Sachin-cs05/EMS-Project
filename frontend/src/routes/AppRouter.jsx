// ── AppRouter.jsx ─────────────────────────────────────────────────────────────
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const DashboardLayout = lazy(() => import('../components/layout/DashboardLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const EmployeeList = lazy(() => import('../pages/admin/EmployeeList'));
const AddEmployee = lazy(() => import('../pages/admin/AddEmployee'));
const EditEmployee = lazy(() => import('../pages/admin/EditEmployee'));
const EmployeeProfile = lazy(() => import('../pages/admin/EmployeeProfile'));
const DepartmentList = lazy(() => import('../pages/admin/DepartmentList'));
const AttendanceManagement = lazy(() => import('../pages/admin/AttendanceManagement'));
const LeaveManagement = lazy(() => import('../pages/admin/LeaveManagement'));
const Analytics = lazy(() => import('../pages/admin/Analytics'));
const EmployeeDashboard = lazy(() => import('../pages/employee/EmployeeDashboard'));
const MyProfile = lazy(() => import('../pages/employee/MyProfile'));
const MyAttendance = lazy(() => import('../pages/employee/MyAttendance'));
const ApplyLeave = lazy(() => import('../pages/employee/ApplyLeave'));
const LeaveHistory = lazy(() => import('../pages/employee/LeaveHistory'));

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13]">
      <div className="card px-5 py-4 flex items-center gap-3">
        <span className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading workspace...</span>
      </div>
    </div>
  );
}

export default function AppRouter() {
  const { token, user } = useSelector((state) => state.auth);
  const fallbackPath = token
    ? user?.role === 'admin'
      ? '/admin'
      : '/employee'
    : '/login';

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<DashboardLayout role="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<EmployeeList />} />
              <Route path="/admin/employees/add" element={<AddEmployee />} />
              <Route path="/admin/employees/:id/edit" element={<EditEmployee />} />
              <Route path="/admin/employees/:id" element={<EmployeeProfile />} />
              <Route path="/admin/departments" element={<DepartmentList />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/leaves" element={<LeaveManagement />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>
          </Route>

          <Route element={<DashboardLayout role="employee" />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/profile" element={<MyProfile />} />
            <Route path="/employee/attendance" element={<MyAttendance />} />
            <Route path="/employee/leaves" element={<LeaveHistory />} />
            <Route path="/employee/leaves/apply" element={<ApplyLeave />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>
    </Suspense>
  );
}
