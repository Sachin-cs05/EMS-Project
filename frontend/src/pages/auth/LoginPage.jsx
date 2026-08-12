import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { loginThunk, clearError } from '../../features/slices';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/employee', { replace: true });
  }, [user]);

  useEffect(() => { return () => dispatch(clearError()); }, []);

  const onSubmit = async (data) => {
    const result = await dispatch(loginThunk(data));
    if (loginThunk.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'admin' ? '/admin' : '/employee', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f0f13]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden
                      bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width:  `${80 + i * 60}px`,
                height: `${80 + i * 60}px`,
                top:    `${10 + i * 15}%`,
                left:   `${5 + i * 12}%`,
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-lg">
              <span className="text-white text-2xl font-black">E</span>
            </div>
            <h1 className="text-4xl font-black mb-4 leading-tight">
              Employee<br />Management<br />System
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              A modern, full-featured platform for managing your entire workforce — attendance, leaves, and more.
            </p>
            <div className="mt-10 flex gap-6">
              {[['99.9%', 'Uptime'], ['10k+', 'Records'], ['Fast', 'Reports']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-black">{v}</div>
                  <div className="text-white/60 text-sm">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black">E</span>
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">EMS Pro</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Sign in to your EMS account</p>

          {/* Demo credentials */}
          <div className="mb-6 p-4 rounded-2xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-primary-600 dark:text-primary-300">
              <p>Admin: <span className="font-mono font-bold">admin@ems.com</span> / <span className="font-mono font-bold">Admin@123</span></p>
              <p>Employee: <span className="font-mono font-bold">emp@ems.com</span> / <span className="font-mono font-bold">Emp@123</span></p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <HiOutlineMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <HiOutlineLockClosed size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <HiOutlineEyeOff size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            EMS Pro © {new Date().getFullYear()} · Built with React + Node.js
          </p>
        </motion.div>
      </div>
    </div>
  );
}
