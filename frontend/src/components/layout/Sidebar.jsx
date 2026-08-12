import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineCalendar, HiOutlineClipboardList, HiOutlineChartBar,
  HiOutlineUser, HiOutlineClock, HiOutlineDocumentText,
  HiOutlineLogout, HiOutlineMenuAlt2, HiOutlineX,
} from 'react-icons/hi';
import { logoutThunk } from '../../features/auth/authSlice';
import { setSidebarOpen } from '../../features/ui/uiSlice';

const adminNav = [
  { label: 'Dashboard',   icon: HiOutlineHome,           to: '/admin' },
  { label: 'Employees',   icon: HiOutlineUsers,          to: '/admin/employees' },
  { label: 'Departments', icon: HiOutlineOfficeBuilding, to: '/admin/departments' },
  { label: 'Attendance',  icon: HiOutlineCalendar,       to: '/admin/attendance' },
  { label: 'Leaves',      icon: HiOutlineClipboardList,  to: '/admin/leaves' },
  { label: 'Analytics',   icon: HiOutlineChartBar,       to: '/admin/analytics' },
];

const employeeNav = [
  { label: 'Dashboard',  icon: HiOutlineHome,         to: '/employee' },
  { label: 'My Profile', icon: HiOutlineUser,         to: '/employee/profile' },
  { label: 'Attendance', icon: HiOutlineClock,        to: '/employee/attendance' },
  { label: 'My Leaves',  icon: HiOutlineDocumentText, to: '/employee/leaves' },
];

export default function Sidebar({ role }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const open      = useSelector((s) => s.ui.sidebarOpen);
  const user      = useSelector((s) => s.auth.user);
  const navItems  = role === 'admin' ? adminNav : employeeNav;

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => dispatch(setSidebarOpen(false))} />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: open ? 256 : 64 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-30 h-screen flex flex-col bg-white dark:bg-[#13131f]
                   border-r border-gray-100 dark:border-white/5 overflow-hidden shadow-sm"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-glow">
                  <span className="text-white text-sm font-bold">E</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-base whitespace-nowrap">EMS Pro</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => dispatch(setSidebarOpen(!open))}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white transition-colors">
            {open ? <HiOutlineX size={18} /> : <HiOutlineMenuAlt2 size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-3 mt-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink key={to} to={to} end={to === '/admin' || to === '/employee'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${!open ? 'justify-center' : ''}`}
              title={!open ? label : undefined}>
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pb-4 border-t border-gray-100 dark:border-white/5 pt-3">
          <button onClick={handleLogout}
            className={`nav-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 ${!open ? 'justify-center' : ''}`}
            title={!open ? 'Logout' : undefined}>
            <HiOutlineLogout size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {open && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
