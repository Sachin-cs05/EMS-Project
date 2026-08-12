import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiOutlineCalendar } from 'react-icons/hi';
import { applyLeave, fetchMyLeaves, showToast } from '../../features/slices';

export default function ApplyLeave() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { leaveBalance } = useSelector((s) => s.leaves);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    dispatch(fetchMyLeaves());
  }, [dispatch]);

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const leaveType = watch('leaveType');

  const totalDays =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1)
      : 0;

  const onSubmit = async (data) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      dispatch(showToast({ type: 'error', message: 'End date cannot be before start date' }));
      return;
    }

    setSubmitting(true);
    const res = await dispatch(applyLeave(data));
    setSubmitting(false);

    if (applyLeave.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Leave application submitted!' }));
      navigate('/employee/leaves');
      return;
    }

    dispatch(showToast({ type: 'error', message: res.payload || 'Application failed' }));
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Link to="/employee/leaves" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
          <HiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Apply for Leave</h1>
          <p className="page-subtitle">Submit a new leave request</p>
        </div>
      </div>

      {leaveBalance && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          {[
            { type: 'sick', label: 'Sick', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', selected: leaveType === 'sick' },
            { type: 'casual', label: 'Casual', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', selected: leaveType === 'casual' },
            { type: 'earned', label: 'Earned', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', selected: leaveType === 'earned' },
          ].map(({ type, label, color, bg, selected }) => (
            <div
              key={type}
              className={`${bg} rounded-2xl p-3 text-center ring-2 transition-all ${selected ? 'ring-primary-500' : 'ring-transparent'}`}
            >
              <p className={`text-2xl font-black ${color}`}>{leaveBalance[type]}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              <p className="text-[10px] text-gray-400">days left</p>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Leave Type *</label>
            <select className={`select ${errors.leaveType ? 'input-error' : ''}`} {...register('leaveType', { required: 'Select a leave type' })}>
              <option value="">Select type</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="earned">Earned Leave</option>
            </select>
            {errors.leaveType && <p className="text-xs text-red-500 mt-1">{errors.leaveType.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Start Date *</label>
              <div className="relative">
                <HiOutlineCalendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" className={`input pl-9 ${errors.startDate ? 'input-error' : ''}`} {...register('startDate', { required: 'Required' })} />
              </div>
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">End Date *</label>
              <div className="relative">
                <HiOutlineCalendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="date" className={`input pl-9 ${errors.endDate ? 'input-error' : ''}`} {...register('endDate', { required: 'Required' })} />
              </div>
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {totalDays > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10">
              <HiOutlineCalendar size={16} className="text-primary-600 dark:text-primary-400" />
              <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                {totalDays} working day{totalDays !== 1 ? 's' : ''} requested
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Reason *</label>
            <textarea
              className={`input resize-none ${errors.reason ? 'input-error' : ''}`}
              rows={4}
              placeholder="Please describe the reason for your leave request (min 10 characters)..."
              {...register('reason', {
                required: 'Reason is required',
                minLength: { value: 10, message: 'Min 10 characters' },
              })}
            />
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/employee/leaves" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn-primary px-8">
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
