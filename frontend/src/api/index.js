import api from './axiosInstance.js';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginApi           = (data)        => api.post('/auth/login', data);
export const getMeApi           = ()             => api.get('/auth/me');
export const logoutApi          = ()             => api.post('/auth/logout');
export const changePasswordApi  = (data)         => api.put('/auth/change-password', data);
export const forgotPasswordApi  = (data)         => api.post('/auth/forgot-password', data);
export const resetPasswordApi   = (token, data)  => api.put(`/auth/reset-password/${token}`, data);

// ── Employees ─────────────────────────────────────────────────────────────────
export const getEmployeesApi    = (params)       => api.get('/employees', { params });
export const getEmployeeApi     = (id)           => api.get(`/employees/${id}`);
export const createEmployeeApi  = (data)         => api.post('/employees', data);
export const updateEmployeeApi  = (id, data)     => api.put(`/employees/${id}`, data);
export const deleteEmployeeApi  = (id)           => api.delete(`/employees/${id}`);
export const uploadImageApi     = (id, data)     => api.put(`/employees/${id}/profile-image`, data);

// ── Departments ───────────────────────────────────────────────────────────────
export const getDepartmentsApi  = ()             => api.get('/departments');
export const createDeptApi      = (data)         => api.post('/departments', data);
export const updateDeptApi      = (id, data)     => api.put(`/departments/${id}`, data);
export const deleteDeptApi      = (id)           => api.delete(`/departments/${id}`);

// ── Attendance ────────────────────────────────────────────────────────────────
export const checkInApi             = ()         => api.post('/attendance/check-in');
export const checkOutApi            = ()         => api.put('/attendance/check-out');
export const getTodayAttendanceApi  = ()         => api.get('/attendance/today');
export const getMyAttendanceApi     = (params)   => api.get('/attendance/my-history', { params });
export const getAllAttendanceApi     = (params)   => api.get('/attendance', { params });
export const markAttendanceApi      = (data)     => api.post('/attendance/mark', data);
export const getAttendanceReportApi = (params)   => api.get('/attendance/report', { params });

// ── Leaves ────────────────────────────────────────────────────────────────────
export const applyLeaveApi      = (data)         => api.post('/leaves/apply', data);
export const getMyLeavesApi     = ()             => api.get('/leaves/my-leaves');
export const cancelLeaveApi     = (id)           => api.put(`/leaves/${id}/cancel`);
export const getAllLeavesApi     = (params)       => api.get('/leaves', { params });
export const approveLeaveApi    = (id, data)     => api.put(`/leaves/${id}/approve`, data);
export const rejectLeaveApi     = (id, data)     => api.put(`/leaves/${id}/reject`, data);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStatsApi   = ()         => api.get('/dashboard/stats');
export const getDashboardChartsApi  = ()         => api.get('/dashboard/charts');
export const getRecentActivityApi   = ()         => api.get('/dashboard/recent-activity');

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotificationsApi    = ()         => api.get('/notifications');
export const markReadApi            = (id)       => api.put(`/notifications/${id}/read`);
export const markAllReadApi         = ()         => api.put('/notifications/read-all');
