import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import { forgotPasswordApi } from '../../api/index.js';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      setError('');
      await forgotPasswordApi({ email });
      setSent(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card p-8"
      >
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              If that email is registered, a password reset link has been sent to it.
            </p>
            <Link to="/login" className="btn-primary justify-center w-full">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
            >
              <HiArrowLeft size={16} /> Back to Login
            </Link>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Forgot Password?</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send a reset link.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                <div className="relative">
                  <HiOutlineMail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                    })}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
