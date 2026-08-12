// ════════════════════════════════════════════════════════════════════════════
//  EmployeeDashboard.jsx
// ════════════════════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineCalendar, HiOutlinePlus } from 'react-icons/hi';
import { fetchTodayAtt, checkIn, checkOut, fetchMyLeaves, fetchNotifications } from '../../features/slices';
import { showToast } from '../../features/slices';
import { Badge, Avatar } from '../../components/common/index.jsx';
import { formatTime, formatDate } from '../../components/common/timeUtils';

export function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { user, employee }        = useSelector((s) => s.auth);
  const { today }                 = useSelector((s) => s.attendance);
  const { myLeaves, leaveBalance } = useSelector((s) => s.leaves);
  const { list: notifications }   = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchTodayAtt());
    dispatch(fetchMyLeaves());
    dispatch(fetchNotifications());
  }, []);

  const handleCheckIn = async () => {
    const res = await dispatch(checkIn());
    if (checkIn.fulfilled.match(res)) dispatch(showToast({ type: 'success', message: 'Checked in!' }));
    else dispatch(showToast({ type: 'error', message: res.payload || 'Check-in failed' }));
  };

  const handleCheckOut = async () => {
    const res = await dispatch(checkOut());
    if (checkOut.fulfilled.match(res)) dispatch(showToast({ type: 'success', message: 'Checked out. Have a great day!' }));
    else dispatch(showToast({ type: 'error', message: res.payload || 'Check-out failed' }));
  };

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-br from-primary-600 to-purple-700 text-white border-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-white/70">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</p>
            <h1 className="text-2xl font-black mt-0.5">{user?.name} 👋</h1>
            <p className="text-sm text-white/70 mt-1">{employee?.designation} · {employee?.department?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-xl font-black mt-1">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </motion.div>

      {/* Today's attendance card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Today's Attendance</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-gray-400">Check In</p>
              <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{formatTime(today?.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Check Out</p>
              <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{formatTime(today?.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Hours</p>
              <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">
                {today?.workHours ? `${today.workHours}h` : '—'}
              </p>
            </div>
          </div>
          {today?.status && <Badge status={today.status} />}
          <div className="sm:ml-auto flex gap-2">
            {!today?.checkIn && (
              <button onClick={handleCheckIn} className="btn-primary">
                <HiOutlineClock size={16} /> Check In
              </button>
            )}
            {today?.checkIn && !today?.checkOut && (
              <button onClick={handleCheckOut} className="btn-secondary">
                <HiOutlineClock size={16} /> Check Out
              </button>
            )}
            {today?.checkOut && (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-semibold">
                <HiOutlineCheckCircle size={18} /> Day completed
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Leave balance + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leave balance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leave Balance</h2>
            <Link to="/employee/leaves/apply" className="btn-primary py-1.5 text-xs">
              <HiOutlinePlus size={13} /> Apply
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'sick',   label: 'Sick',   color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-500/10' },
              { type: 'casual', label: 'Casual', color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { type: 'earned', label: 'Earned', color: 'text-green-600 dark:text-green-400',bg: 'bg-green-50 dark:bg-green-500/10' },
            ].map(({ type, label, color, bg }) => (
              <div key={type} className={`${bg} rounded-2xl p-3 text-center`}>
                <p className={`text-2xl font-black ${color}`}>{leaveBalance?.[type] ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Notifications</h2>
          <div className="space-y-2">
            {notifications.slice(0, 4).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No notifications</p>
            ) : (
              notifications.slice(0, 4).map((n) => (
                <div key={n._id} className={`flex items-start gap-3 p-2.5 rounded-xl text-xs
                  ${!n.isRead ? 'bg-primary-50/60 dark:bg-primary-500/5' : ''}`}>
                  <span className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/20'}`} />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{n.title}</p>
                    <p className="text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent leave history */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Leave Requests</h2>
          <Link to="/employee/leaves" className="text-xs text-primary-600 hover:text-primary-700 font-medium">View all</Link>
        </div>
        {myLeaves.slice(0, 4).length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No leave requests yet.</p>
        ) : (
          <div className="space-y-3">
            {myLeaves.slice(0, 4).map((leave) => (
              <div key={leave._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/15 flex items-center justify-center">
                  <HiOutlineDocumentText size={15} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white capitalize">{leave.leaveType} Leave</p>
                  <p className="text-xs text-gray-400">{formatDate(leave.startDate)} · {leave.totalDays} day(s)</p>
                </div>
                <Badge status={leave.status} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default EmployeeDashboard;
