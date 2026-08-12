import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';
import { fetchTodayAtt, checkIn, checkOut, fetchMyAttendance } from '../../features/slices';
import { showToast } from '../../features/slices';
import { Badge, EmptyState } from '../../components/common/index.jsx';
import { formatDate, formatTime } from '../../components/common/timeUtils';

export default function MyAttendance() {
  const dispatch = useDispatch();
  const { today, myHistory, loading } = useSelector((s) => s.attendance);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  useEffect(() => {
    dispatch(fetchTodayAtt());
  }, []);

  useEffect(() => {
    dispatch(fetchMyAttendance({ month, year }));
  }, [month, year]);

  const handleCheckIn = async () => {
    const res = await dispatch(checkIn());
    if (checkIn.fulfilled.match(res)) dispatch(showToast({ type: 'success', message: 'Checked in!' }));
    else dispatch(showToast({ type: 'error', message: res.payload || 'Failed' }));
  };

  const handleCheckOut = async () => {
    const res = await dispatch(checkOut());
    if (checkOut.fulfilled.match(res)) dispatch(showToast({ type: 'success', message: 'Checked out!' }));
    else dispatch(showToast({ type: 'error', message: res.payload || 'Failed' }));
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years  = [now.getFullYear() - 1, now.getFullYear()];

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="page-title">My Attendance</h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Today</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div><p className="text-xs text-gray-400">Check In</p><p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{formatTime(today?.checkIn)}</p></div>
          <div><p className="text-xs text-gray-400">Check Out</p><p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{formatTime(today?.checkOut)}</p></div>
          <div><p className="text-xs text-gray-400">Hours</p><p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">{today?.workHours ? `${today.workHours}h` : '—'}</p></div>
          {today?.status && <Badge status={today.status} />}
          <div className="ml-auto flex gap-2">
            {!today?.checkIn && <button onClick={handleCheckIn} className="btn-primary"><HiOutlineClock size={16} /> Check In</button>}
            {today?.checkIn && !today?.checkOut && <button onClick={handleCheckOut} className="btn-secondary"><HiOutlineClock size={16} /> Check Out</button>}
            {today?.checkOut && <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-semibold"><HiOutlineCheckCircle size={18}/> Done</span>}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">Attendance History</h2>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="select w-36">
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="select w-24">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{Array(5).fill(0).map((_,i) => <div key={i} className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)}</div>
        ) : myHistory.length === 0 ? (
          <EmptyState title="No records" description="No attendance records found for this period." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Status</th><th className="hidden sm:table-cell">Check In</th><th className="hidden sm:table-cell">Check Out</th><th className="hidden md:table-cell">Hours</th></tr>
              </thead>
              <tbody>
                {myHistory.map((rec) => (
                  <tr key={rec._id}>
                    <td className="font-medium text-gray-800 dark:text-white text-sm">{formatDate(rec.date)}</td>
                    <td><Badge status={rec.status} /></td>
                    <td className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">{formatTime(rec.checkIn)}</td>
                    <td className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">{formatTime(rec.checkOut)}</td>
                    <td className="hidden md:table-cell text-sm font-semibold text-gray-700 dark:text-gray-300">{rec.workHours ? `${rec.workHours}h` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
