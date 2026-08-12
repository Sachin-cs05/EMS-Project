import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBell, HiOutlineSun, HiOutlineMoon,
  HiOutlineMenuAlt2, HiOutlineCheckCircle, HiX,
} from 'react-icons/hi';
import { toggleDarkMode, setSidebarOpen } from '../../features/ui/uiSlice';
import { fetchNotifications, markRead, markAllRead } from '../../features/notification/notificationSlice';
import { formatDistanceToNow } from './timeUtils';

const breadcrumbMap = {
  '/admin':                 'Dashboard',
  '/admin/employees':       'Employees',
  '/admin/employees/add':   'Add Employee',
  '/admin/departments':     'Departments',
  '/admin/attendance':      'Attendance',
  '/admin/leaves':          'Leave Management',
  '/admin/analytics':       'Analytics',
  '/employee':              'Dashboard',
  '/employee/profile':      'My Profile',
  '/employee/attendance':   'My Attendance',
  '/employee/leaves':       'Leave History',
  '/employee/leaves/apply': 'Apply Leave',
};

export default function Navbar() {
  const dispatch   = useDispatch();
  const location   = useLocation();
  const darkMode   = useSelector((s) => s.ui.darkMode);
  const { list: notifications, unreadCount } = useSelector((s) => s.notifications);
  const user       = useSelector((s) => s.auth.user);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef   = useRef(null);

  const title = breadcrumbMap[location.pathname] || 'EMS Pro';

  useEffect(() => { dispatch(fetchNotifications()); }, []);

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6
                       bg-white dark:bg-[#13131f] border-b border-gray-100 dark:border-white/5 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={() => dispatch(setSidebarOpen())}
          className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
          <HiOutlineMenuAlt2 size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors">
          {darkMode ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors">
            <HiOutlineBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 card shadow-card-lg z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => dispatch(markAllRead())}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                      <HiOutlineCheckCircle size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
                  ) : notifications.map((n) => (
                    <div key={n._id} onClick={() => { if (!n.isRead) dispatch(markRead(n._id)); }}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors
                        ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatDistanceToNow(n.createdAt)}</p>
                        </div>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-glow cursor-pointer">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
