import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import { fetchAllAttendance, fetchDepartments } from '../../features/slices';
import { markAttendanceApi } from '../../api/index.js';
import { showToast } from '../../features/slices';
import { Badge, Avatar, EmptyState, SkeletonTable, Modal } from '../../components/common/index.jsx';
import { formatDate, formatTime } from '../../components/common/timeUtils';

export default function AttendanceManagement() {
  const dispatch = useDispatch();
  const { allRecords, loading } = useSelector((s) => s.attendance);
  const { list: departments }   = useSelector((s) => s.departments);
  const { list: employees }     = useSelector((s) => s.employees);

  const [date,       setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [department, setDepartment] = useState('');
  const [markModal,  setMarkModal]  = useState(false);
  const [saving,     setSaving]     = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => { dispatch(fetchDepartments()); }, []);
  useEffect(() => { dispatch(fetchAllAttendance({ date, department })); }, [date, department]);

  const onMarkAttendance = async (data) => {
    setSaving(true);
    try {
      await markAttendanceApi({ ...data, date });
      dispatch(showToast({ type: 'success', message: 'Attendance marked!' }));
      dispatch(fetchAllAttendance({ date, department }));
      setMarkModal(false);
      reset();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: e.response?.data?.message || 'Failed' }));
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    present:  'text-green-600  dark:text-green-400',
    absent:   'text-red-600    dark:text-red-400',
    late:     'text-yellow-600 dark:text-yellow-400',
    half_day: 'text-blue-600   dark:text-blue-400',
    holiday:  'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Daily attendance records</p>
        </div>
        <button onClick={() => setMarkModal(true)} className="btn-primary">
          <HiOutlineCalendar size={16} /> Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <HiOutlineCalendar size={16} className="text-gray-400" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input w-44" />
        </div>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="select w-44">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{allRecords.length} records</span>
      </div>

      {/* Summary bar */}
      {allRecords.length > 0 && (() => {
        const present  = allRecords.filter(r => r.status === 'present').length;
        const absent   = allRecords.filter(r => r.status === 'absent').length;
        const late     = allRecords.filter(r => r.status === 'late').length;
        const halfDay  = allRecords.filter(r => r.status === 'half_day').length;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Present', present, 'green'], ['Absent', absent, 'red'], ['Late', late, 'yellow'], ['Half Day', halfDay, 'blue']].map(([l, v, c]) => (
              <div key={l} className={`rounded-xl p-3 bg-${c}-50 dark:bg-${c}-500/10 text-center`}>
                <p className={`text-2xl font-black text-${c}-600 dark:text-${c}-400`}>{v}</p>
                <p className={`text-xs text-${c}-500 mt-0.5`}>{l}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={8} /></div>
        ) : allRecords.length === 0 ? (
          <EmptyState title="No attendance records" description="No records found for this date and filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="hidden sm:table-cell">Department</th>
                  <th>Status</th>
                  <th className="hidden md:table-cell">Check In</th>
                  <th className="hidden md:table-cell">Check Out</th>
                  <th className="hidden lg:table-cell">Work Hours</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar src={rec.employee?.profileImage} name={rec.employee?.firstName} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {rec.employee?.firstName} {rec.employee?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{rec.employee?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {rec.employee?.department?.name || '—'}
                    </td>
                    <td><Badge status={rec.status} /></td>
                    <td className="hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(rec.checkIn)}
                    </td>
                    <td className="hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {formatTime(rec.checkOut)}
                    </td>
                    <td className="hidden lg:table-cell">
                      {rec.workHours
                        ? <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{rec.workHours}h</span>
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      <Modal isOpen={markModal} onClose={() => { setMarkModal(false); reset(); }} title="Mark Attendance" size="sm">
        <form onSubmit={handleSubmit(onMarkAttendance)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Employee *</label>
            <select className={`select ${errors.employeeId ? 'input-error' : ''}`}
              {...register('employeeId', { required: 'Select an employee' })}>
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
              ))}
            </select>
            {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Status *</label>
            <select className={`select ${errors.status ? 'input-error' : ''}`}
              {...register('status', { required: 'Select a status' })}>
              <option value="">Select status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="holiday">Holiday</option>
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Note</label>
            <input className="input" placeholder="Optional note…" {...register('note')} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setMarkModal(false); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Mark'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
