import { configureStore } from '@reduxjs/toolkit';
import authReducer         from '../features/auth/authSlice';
import employeeReducer     from '../features/employee/employeeSlice';
import departmentReducer   from '../features/department/departmentSlice';
import attendanceReducer   from '../features/attendance/attendanceSlice';
import leaveReducer        from '../features/leave/leaveSlice';
import notificationReducer from '../features/notification/notificationSlice';
import uiReducer           from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    employees:     employeeReducer,
    departments:   departmentReducer,
    attendance:    attendanceReducer,
    leaves:        leaveReducer,
    notifications: notificationReducer,
    ui:            uiReducer,
  },
});

export default store;
