import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiCheckCircle } from 'react-icons/hi';
import { resetPasswordApi } from '../../api/index.js';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      setLoading(true); setError('');
      await resetPasswordApi(token, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (e) {
      setError(e.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card p-8"
      >
        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-sm text-gray-500">Redirecting you to login…</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Set New Password</h2>
            <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                <div className="relative">
                  <HiOutlineLockClosed size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPwd ? 'text' : 'password'} placeholder="At least 8 characters"
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password', {
                      required: 'Required',
                      minLength: { value: 8, message: 'Min 8 characters' },
                      validate: (value) =>
                        /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) ||
                        'Use uppercase, lowercase, and a number',
                    })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <HiOutlineLockClosed size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" placeholder="Repeat password"
                    className={`input pl-10 ${errors.confirm ? 'input-error' : ''}`}
                    {...register('confirm', {
                      required: 'Required',
                      validate: (v) => v === watch('password') || 'Passwords do not match',
                    })} />
                </div>
                {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
