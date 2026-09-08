import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiOutlineX,
} from 'react-icons/hi';

import { logoutThunk } from '../../features/auth/authSlice';
import { setSidebarOpen } from '../../features/ui/uiSlice';

const adminNav = [
  {
    label: 'Dashboard',
    icon: HiOutlineHome,
    to: '/admin',
  },
  {
    label: 'Employees',
    icon: HiOutlineUsers,
    to: '/admin/employees',
  },
  {
    label: 'Departments',
    icon: HiOutlineOfficeBuilding,
    to: '/admin/departments',
  },
  {
    label: 'Attendance',
    icon: HiOutlineCalendar,
    to: '/admin/attendance',
  },
  {
    label: 'Leaves',
    icon: HiOutlineClipboardList,
    to: '/admin/leaves',
  },
  {
    label: 'Analytics',
    icon: HiOutlineChartBar,
    to: '/admin/analytics',
  },
];

const employeeNav = [
  {
    label: 'Dashboard',
    icon: HiOutlineHome,
    to: '/employee',
  },
  {
    label: 'My Profile',
    icon: HiOutlineUser,
    to: '/employee/profile',
  },
  {
    label: 'Attendance',
    icon: HiOutlineClock,
    to: '/employee/attendance',
  },
  {
    label: 'My Leaves',
    icon: HiOutlineDocumentText,
    to: '/employee/leaves',
  },
];

export default function Sidebar({ role }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const open = useSelector((s) => s.ui.sidebarOpen);
  const user = useSelector((s) => s.auth.user);

  const navItems = role === 'admin' ? adminNav : employeeNav;

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{
          width: open ? 260 : 76,
        }}
        transition={{
          duration: 0.25,
          ease: 'easeInOut',
        }}
        className={`
          fixed left-0 top-0 z-50
          h-screen
          flex flex-col
          overflow-hidden
          bg-white
          dark:bg-[#111318]
          border-r
          border-slate-200/80
          dark:border-white/[0.06]
          shadow-[4px_0_24px_rgba(15,23,42,0.03)]
          dark:shadow-none
          transform transition-transform duration-300
          md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div
          className="
            h-[72px]
            flex-shrink-0
            flex items-center
            justify-between
            px-4
            border-b
            border-slate-100
            dark:border-white/[0.06]
          "
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div
                  className="
                    w-10 h-10
                    rounded-xl
                    flex items-center justify-center
                    bg-gradient-to-br
                    from-indigo-500
                    to-violet-600
                    shadow-lg
                    shadow-indigo-500/20
                  "
                >
                  <span className="text-white text-lg font-bold">
                    E
                  </span>
                </div>

                <div>
                  <h1 className="text-[15px] font-bold text-slate-900 dark:text-white">
                    EMS Pro
                  </h1>

                  <p className="text-[10px] font-medium text-slate-400">
                    Employee Management
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="
                  w-10 h-10
                  mx-auto
                  rounded-xl
                  flex items-center justify-center
                  bg-gradient-to-br
                  from-indigo-500
                  to-violet-600
                  shadow-lg
                  shadow-indigo-500/20
                "
              >
                <span className="text-white text-lg font-bold">
                  E
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => dispatch(setSidebarOpen(!open))}
            className="
              absolute
              right-3
              top-[22px]
              w-7 h-7
              rounded-lg
              flex items-center justify-center
              text-slate-400
              hover:text-slate-700
              hover:bg-slate-100
              dark:hover:bg-white/[0.06]
              dark:hover:text-white
              transition-all
            "
          >
            {open ? (
              <HiOutlineX size={17} />
            ) : (
              <HiOutlineMenuAlt2 size={18} />
            )}
          </button>
        </div>

        {/* User */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="
                mx-3
                mt-4
                p-3
                rounded-xl
                bg-slate-50
                dark:bg-white/[0.035]
                border
                border-slate-100
                dark:border-white/[0.05]
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-9 h-9
                    flex-shrink-0
                    rounded-full
                    flex items-center justify-center
                    bg-indigo-100
                    dark:bg-indigo-500/15
                    text-indigo-600
                    dark:text-indigo-400
                    font-semibold
                    text-sm
                  "
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>

                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                    {user?.role || role}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          {open && (
            <p className="px-3 mb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Workspace
            </p>
          )}

          <div className="space-y-1">
            {navItems.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                end={
                  to === '/admin' ||
                  to === '/employee'
                }
                title={!open ? label : undefined}
                onClick={() => {
                  if (window.innerWidth < 768) dispatch(setSidebarOpen(false));
                }}
                className={({ isActive }) =>
                  `
                  group
                  relative
                  flex items-center
                  ${open ? 'gap-3 px-3' : 'justify-center'}
                  h-11
                  rounded-xl
                  text-sm
                  font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? `
                        bg-indigo-50
                        text-indigo-600
                        dark:bg-indigo-500/10
                        dark:text-indigo-400
                      `
                      : `
                        text-slate-500
                        hover:bg-slate-50
                        hover:text-slate-900
                        dark:text-slate-400
                        dark:hover:bg-white/[0.04]
                        dark:hover:text-white
                      `
                  }
                `
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          -translate-y-1/2
                          w-1
                          h-6
                          rounded-r-full
                          bg-indigo-500
                        "
                      />
                    )}

                    <Icon
                      size={19}
                      className="flex-shrink-0"
                    />

                    <AnimatePresence>
                      {open && (
                        <motion.span
                          initial={{
                            opacity: 0,
                            width: 0,
                          }}
                          animate={{
                            opacity: 1,
                            width: 'auto',
                          }}
                          exit={{
                            opacity: 0,
                            width: 0,
                          }}
                          transition={{
                            duration: 0.18,
                          }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div
          className="
            px-3
            pb-4
            pt-3
            border-t
            border-slate-100
            dark:border-white/[0.06]
          "
        >
          <button
            onClick={handleLogout}
            title={!open ? 'Logout' : undefined}
            className={`
              w-full
              h-11
              rounded-xl
              flex items-center
              ${
                open
                  ? 'gap-3 px-3'
                  : 'justify-center'
              }
              text-sm
              font-medium
              text-red-500
              hover:bg-red-50
              dark:hover:bg-red-500/10
              transition-all
            `}
          >
            <HiOutlineLogout
              size={19}
              className="flex-shrink-0"
            />

            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{
                    opacity: 0,
                    width: 0,
                  }}
                  animate={{
                    opacity: 1,
                    width: 'auto',
                  }}
                  exit={{
                    opacity: 0,
                    width: 0,
                  }}
                  className="whitespace-nowrap overflow-hidden"
                >
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
