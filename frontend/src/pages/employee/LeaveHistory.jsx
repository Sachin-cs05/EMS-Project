import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import { fetchMyLeaves } from '../../features/slices';
import { showToast } from '../../features/slices';
import { cancelLeaveApi } from '../../api/index.js';
import { Badge, EmptyState, ConfirmDialog } from '../../components/common/index.jsx';
import { formatDate } from '../../components/common/timeUtils';

export default function LeaveHistory() {
  const dispatch = useDispatch();
  const { myLeaves, leaveBalance, loading } = useSelector((s) => s.leaves);
  const [cancelId,   setCancelId]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { dispatch(fetchMyLeaves()); }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelLeaveApi(cancelId);
      dispatch(showToast({ type: 'success', message: 'Leave cancelled' }));
      dispatch(fetchMyLeaves());
    } catch (e) {
      dispatch(showToast({ type: 'error', message: e.response?.data?.message || 'Failed' }));
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p className="page-subtitle">{myLeaves.length} total requests</p>
        </div>
        <Link to="/employee/leaves/apply" className="btn-primary">
          <HiOutlinePlus size={16} /> Apply Leave
        </Link>
      </div>

      {leaveBalance && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'sick',   label: 'Sick',   color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-500/10' },
            { type: 'casual', label: 'Casual', color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { type: 'earned', label: 'Earned', color: 'text-green-600 dark:text-green-400',bg: 'bg-green-50 dark:bg-green-500/10' },
          ].map(({ type, label, color, bg }) => (
            <div key={type} className={`${bg} rounded-2xl p-3 text-center`}>
              <p className={`text-2xl font-black ${color}`}>{leaveBalance[type]}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              <p className="text-[10px] text-gray-400">days left</p>
            </div>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        {myLeaves.length === 0 ? (
          <EmptyState
            title="No leave requests"
            description="You haven't applied for any leave yet."
            action={<Link to="/employee/leaves/apply" className="btn-primary"><HiOutlinePlus size={14} /> Apply Now</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Type</th><th className="hidden sm:table-cell">Duration</th><th className="hidden md:table-cell">Days</th><th>Status</th><th className="hidden lg:table-cell">Note</th><th></th></tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div>
                        <Badge status={leave.leaveType} />
                        <p className="text-xs text-gray-400 mt-1">{formatDate(leave.createdAt)}</p>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</p>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{leave.totalDays}</span>
                    </td>
                    <td><Badge status={leave.status} /></td>
                    <td className="hidden lg:table-cell text-xs text-gray-500 max-w-[160px] truncate">{leave.reviewNote || '—'}</td>
                    <td>
                      {leave.status === 'pending' && (
                        <button onClick={() => setCancelId(leave._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors">
                          <HiOutlineX size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        isOpen={!!cancelId} onClose={() => setCancelId(null)} onConfirm={handleCancel} loading={cancelling}
        title="Cancel Leave Request?" message="Are you sure you want to cancel this leave application?" />
    </div>
  );
}
