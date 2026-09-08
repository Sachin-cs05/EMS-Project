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
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0c0e12]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-[#111318] border-r border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.22),transparent_42%),radial-gradient(circle_at_80%_85%,rgba(124,58,237,0.16),transparent_38%)]" />
        <div className="absolute inset-0 opacity-[0.06]">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-indigo-400 blur-3xl"
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
        <div className="relative z-10 flex flex-col justify-center px-14 xl:px-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-7 shadow-lg shadow-indigo-500/20">
              <span className="text-white text-2xl font-black">E</span>
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-indigo-300 font-semibold mb-3">EMS Pro</p>
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-[1.08] tracking-tight">
              Your people,<br />managed better.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              A modern, full-featured platform for managing your entire workforce — attendance, leaves, and more.
            </p>
            <div className="mt-10 flex gap-6">
              {[['99.9%', 'Uptime'], ['10k+', 'Records'], ['Fast', 'Reports']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-black">{v}</div>
                  <div className="text-slate-500 text-xs mt-1">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-slate-50 dark:bg-[#0c0e12]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black">E</span>
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white">EMS Pro</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500 mb-3">Admin workspace</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Sign in to your EMS Pro account</p>

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
