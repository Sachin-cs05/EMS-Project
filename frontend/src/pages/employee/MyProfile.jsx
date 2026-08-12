import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { HiOutlinePhotograph, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { changePasswordApi, uploadImageApi } from '../../api/index.js';
import { getMeThunk, showToast } from '../../features/slices';
import { Avatar, Badge } from '../../components/common/index.jsx';
import { formatDate } from '../../components/common/timeUtils';

export default function MyProfile() {
  const dispatch = useDispatch();
  const { user, employee } = useSelector((s) => s.auth);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const fileRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setImgLoading(true);
    const fd = new FormData();
    fd.append('profileImage', file);

    try {
      await uploadImageApi(employee?._id, fd);
      await dispatch(getMeThunk());
      dispatch(showToast({ type: 'success', message: 'Profile photo updated!' }));
    } catch {
      dispatch(showToast({ type: 'error', message: 'Upload failed' }));
    } finally {
      setImgLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      dispatch(showToast({ type: 'error', message: 'Passwords do not match' }));
      return;
    }

    setPwdLoading(true);
    try {
      await changePasswordApi({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      dispatch(showToast({ type: 'success', message: 'Password changed successfully!' }));
      reset();
    } catch (e) {
      dispatch(showToast({ type: 'error', message: e.response?.data?.message || 'Failed' }));
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <Avatar src={user?.profileImage} name={user?.name} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={imgLoading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
            >
              <HiOutlinePhotograph size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{employee?.designation} - {employee?.department?.name}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <Badge status={employee?.status} />
              <span className="badge badge-gray">{employee?.employeeId}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-gray-100 dark:border-white/10">
          {[
            ['Email', user?.email],
            ['Phone', employee?.phone],
            ['Salary', employee?.salary ? `Rs ${employee.salary.toLocaleString('en-IN')}` : '-'],
            ['Joining Date', formatDate(employee?.joiningDate)],
            ['Address', [employee?.address?.street, employee?.address?.city, employee?.address?.state].filter(Boolean).join(', ') || '-'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{value || '-'}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5 flex items-center gap-2">
          <HiOutlineLockClosed size={16} /> Change Password
        </h2>
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                className={`input pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
                placeholder="Enter current password"
                {...register('currentPassword', { required: 'Required' })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showCurrent ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
                placeholder="Min 6 characters"
                {...register('newPassword', {
                  required: 'Required',
                  minLength: { value: 6, message: 'Min 6 chars' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNew ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Repeat new password"
              {...register('confirmPassword', { required: 'Required' })}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={pwdLoading} className="btn-primary">
              {pwdLoading ? 'Changing...' : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
