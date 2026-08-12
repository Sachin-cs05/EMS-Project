import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineX, HiOutlineFilter, HiOutlineChatAlt } from 'react-icons/hi';
import { fetchAllLeaves, approveLeave, rejectLeave } from '../../features/slices';
import { showToast } from '../../features/slices';
import { Badge, Avatar, EmptyState, SkeletonTable, Modal, Pagination } from '../../components/common/index.jsx';
import { formatDate } from '../../components/common/timeUtils';

export default function LeaveManagement() {
  const dispatch = useDispatch();
  const { allLeaves, loading } = useSelector((s) => s.leaves);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [page,         setPage]         = useState(1);
  const [rejectModal,  setRejectModal]  = useState(null); // leave _id
  const [rejectNote,   setRejectNote]   = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    dispatch(fetchAllLeaves({ status: statusFilter, leaveType: typeFilter, page, limit: 10 }));
  }, [statusFilter, typeFilter, page]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    const res = await dispatch(approveLeave({ id, note: '' }));
    setActionLoading('');
    if (approveLeave.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Leave approved!' }));
      dispatch(fetchAllLeaves({ status: statusFilter, leaveType: typeFilter, page, limit: 10 }));
    } else {
      dispatch(showToast({ type: 'error', message: res.payload || 'Failed' }));
    }
  };

  const handleReject = async () => {
    setActionLoading(rejectModal);
    const res = await dispatch(rejectLeave({ id: rejectModal, note: rejectNote }));
    setActionLoading('');
    setRejectModal(null);
    setRejectNote('');
    if (rejectLeave.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Leave rejected.' }));
      dispatch(fetchAllLeaves({ status: statusFilter, leaveType: typeFilter, page, limit: 10 }));
    } else {
      dispatch(showToast({ type: 'error', message: res.payload || 'Failed' }));
    }
  };

  const tabs = ['pending', 'approved', 'rejected', 'cancelled'];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Review and manage leave requests</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/10 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => { setStatusFilter(tab); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
              ${statusFilter === tab
                ? 'bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="select w-36">
          <option value="">All Types</option>
          <option value="sick">Sick</option>
          <option value="casual">Casual</option>
          <option value="earned">Earned</option>
        </select>
        <span className="ml-auto text-xs text-gray-400">{allLeaves.length} requests</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={6} /></div>
        ) : allLeaves.length === 0 ? (
          <EmptyState title={`No ${statusFilter} leave requests`} description="Nothing to show here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th className="hidden sm:table-cell">Duration</th>
                  <th className="hidden md:table-cell">Reason</th>
                  <th>Status</th>
                  {statusFilter === 'pending' && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {allLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar src={leave.employee?.profileImage} name={leave.employee?.firstName} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{leave.employee?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td><Badge status={leave.leaveType} /></td>
                    <td className="hidden sm:table-cell">
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                        </p>
                        <p className="text-xs text-gray-400">{leave.totalDays} day(s)</p>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <p className="text-xs text-gray-600 dark:text-gray-400 max-w-[180px] truncate" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </td>
                    <td><Badge status={leave.status} /></td>
                    {statusFilter === 'pending' && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleApprove(leave._id)}
                            disabled={actionLoading === leave._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                       bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400
                                       hover:bg-green-100 transition-colors disabled:opacity-50">
                            <HiOutlineCheck size={14} />
                            {actionLoading === leave._id ? '…' : 'Approve'}
                          </button>
                          <button onClick={() => setRejectModal(leave._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                       bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400
                                       hover:bg-red-100 transition-colors">
                            <HiOutlineX size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectNote(''); }} title="Reject Leave" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Reason for rejection (optional)
            </label>
            <textarea
              value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
              className="input resize-none" rows={3} placeholder="Explain why the leave is being rejected…"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setRejectModal(null); setRejectNote(''); }} className="btn-secondary">Cancel</button>
            <button onClick={handleReject} disabled={actionLoading === rejectModal}
              className="btn-danger bg-red-600 text-white hover:bg-red-700 dark:bg-red-600">
              {actionLoading === rejectModal ? 'Rejecting…' : 'Reject Leave'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
