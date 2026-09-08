import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  HiOutlineBell,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineMenuAlt2,
  HiOutlineCheckCircle,
  HiOutlineSearch,
} from 'react-icons/hi';

import {
  toggleDarkMode,
  setSidebarOpen,
} from '../../features/ui/uiSlice';

import {
  fetchNotifications,
  markRead,
  markAllRead,
} from '../../features/notification/notificationSlice';

import { formatDistanceToNow } from './timeUtils';

const breadcrumbMap = {
  '/admin': 'Dashboard',
  '/admin/employees': 'Employees',
  '/admin/employees/add': 'Add Employee',
  '/admin/departments': 'Departments',
  '/admin/attendance': 'Attendance',
  '/admin/leaves': 'Leave Management',
  '/admin/analytics': 'Analytics',

  '/employee': 'Dashboard',
  '/employee/profile': 'My Profile',
  '/employee/attendance': 'My Attendance',
  '/employee/leaves': 'Leave History',
  '/employee/leaves/apply': 'Apply Leave',
};

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const darkMode = useSelector(
    (s) => s.ui.darkMode
  );

  const {
    list: notifications,
    unreadCount,
    loading: notificationsLoading,
  } = useSelector(
    (s) => s.notifications
  );

  const user = useSelector(
    (s) => s.auth.user
  );

  const [notifOpen, setNotifOpen] =
    useState(false);

  const notifRef = useRef(null);

  const title =
    breadcrumbMap[location.pathname] ||
    'EMS Pro';

  /*
  =========================================================
  FETCH NOTIFICATIONS
  =========================================================
  */

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  /*
  =========================================================
  AUTO REFRESH NOTIFICATIONS
  Every 30 seconds
  =========================================================
  */

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  /*
  =========================================================
  CLOSE NOTIFICATION DROPDOWN
  WHEN CLICKING OUTSIDE
  =========================================================
  */

  useEffect(() => {
    const handler = (e) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handler
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handler
      );
    };
  }, []);

  /*
  =========================================================
  NOTIFICATION CLICK
  =========================================================
  */

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markRead(notification._id));
    }

    setNotifOpen(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  /*
  =========================================================
  MARK ALL READ
  =========================================================
  */

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(markAllRead());
    }
  };

  /*
  =========================================================
  CURRENT DATE
  =========================================================
  */

  const formattedDate =
    new Date().toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );

  return (
    <header
      className="
        h-[72px]
        flex-shrink-0
        sticky top-0
        z-30
        flex items-center
        justify-between
        px-4 md:px-7
        bg-white/90
        dark:bg-[#111318]/90
        backdrop-blur-xl
        border-b
        border-slate-200/70
        dark:border-white/[0.06]
      "
    >

      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="flex items-center gap-4">

        {/* Mobile Menu */}

        <button
          onClick={() =>
            dispatch(setSidebarOpen())
          }
          className="
            md:hidden
            w-9 h-9
            rounded-xl
            flex items-center justify-center
            text-slate-500
            hover:bg-slate-100
            dark:hover:bg-white/[0.06]
            transition-all
          "
        >
          <HiOutlineMenuAlt2 size={20} />
        </button>

        {/* Page Title */}

        <div>

          <h1
            className="
              text-lg
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            {title}
          </h1>

          <p
            className="
              hidden sm:block
              text-xs
              text-slate-400
              mt-0.5
            "
          >
            {formattedDate}
          </p>

        </div>
      </div>


      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="flex items-center gap-2 md:gap-3">

        {/* =================================================
            SEARCH
        ================================================= */}

        <button
          className="
            hidden md:flex
            items-center gap-2
            h-10
            px-3
            min-w-[180px]
            rounded-xl
            border
            border-slate-200
            dark:border-white/[0.07]
            bg-slate-50
            dark:bg-white/[0.03]
            text-slate-400
            hover:border-indigo-200
            dark:hover:border-indigo-500/30
            transition-all
          "
        >
          <HiOutlineSearch size={17} />

          <span className="text-xs">
            Search anything...
          </span>

          <span
            className="
              ml-auto
              text-[10px]
              px-1.5 py-0.5
              rounded-md
              bg-white
              dark:bg-white/[0.06]
              border
              border-slate-200
              dark:border-white/[0.06]
            "
          >
            ⌘K
          </span>
        </button>


        {/* =================================================
            THEME
        ================================================= */}

        <button
          onClick={() =>
            dispatch(toggleDarkMode())
          }
          className="
            w-10 h-10
            rounded-xl
            flex items-center justify-center
            text-slate-500
            dark:text-slate-400
            hover:bg-slate-100
            hover:text-slate-900
            dark:hover:bg-white/[0.06]
            dark:hover:text-white
            transition-all
          "
        >
          {darkMode ? (
            <HiOutlineSun size={19} />
          ) : (
            <HiOutlineMoon size={19} />
          )}
        </button>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div
          className="relative"
          ref={notifRef}
        >

          {/* Bell Button */}

          <button
            onClick={() =>
              setNotifOpen((prev) => !prev)
            }
            className="
              relative
              w-10 h-10
              rounded-xl
              flex items-center justify-center
              text-slate-500
              dark:text-slate-400
              hover:bg-slate-100
              hover:text-slate-900
              dark:hover:bg-white/[0.06]
              dark:hover:text-white
              transition-all
            "
            aria-label="Notifications"
          >

            <HiOutlineBell size={19} />

            {/* Unread Badge */}

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -top-0.5
                  -right-0.5
                  min-w-[17px]
                  h-[17px]
                  px-1
                  rounded-full
                  bg-red-500
                  text-white
                  text-[9px]
                  font-bold
                  flex items-center
                  justify-center
                  border-2
                  border-white
                  dark:border-[#111318]
                "
              >
                {unreadCount > 9
                  ? '9+'
                  : unreadCount}
              </span>
            )}

          </button>


          {/* =================================================
              DROPDOWN
          ================================================= */}

          <AnimatePresence>

            {notifOpen && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.15,
                }}
                className="
                  absolute
                  right-0
                  top-12
                  w-[360px]
                  max-w-[calc(100vw-2rem)]
                  rounded-2xl
                  overflow-hidden
                  bg-white
                  dark:bg-[#181a21]
                  border
                  border-slate-200
                  dark:border-white/[0.07]
                  shadow-2xl
                  shadow-slate-900/10
                  z-50
                "
              >

                {/* =========================================
                    HEADER
                ========================================= */}

                <div
                  className="
                    px-4
                    py-3.5
                    flex items-center
                    justify-between
                    border-b
                    border-slate-100
                    dark:border-white/[0.06]
                  "
                >

                  <div>

                    <div className="flex items-center gap-2">

                      <h3
                        className="
                          text-sm
                          font-bold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        Notifications
                      </h3>

                      {unreadCount > 0 && (
                        <span
                          className="
                            px-1.5
                            py-0.5
                            rounded-md
                            bg-red-50
                            dark:bg-red-500/10
                            text-red-500
                            dark:text-red-400
                            text-[9px]
                            font-bold
                          "
                        >
                          {unreadCount} new
                        </span>
                      )}

                    </div>

                    <p
                      className="
                        text-[10px]
                        text-slate-400
                        mt-0.5
                      "
                    >
                      Stay updated with your workspace
                    </p>

                  </div>


                  {unreadCount > 0 && (

                    <button
                      onClick={handleMarkAllRead}
                      className="
                        text-xs
                        font-medium
                        text-indigo-600
                        dark:text-indigo-400
                        flex items-center gap-1
                        hover:text-indigo-700
                        dark:hover:text-indigo-300
                        transition-colors
                      "
                    >
                      <HiOutlineCheckCircle
                        size={14}
                      />

                      Mark all
                    </button>

                  )}

                </div>


                {/* =========================================
                    NOTIFICATION LIST
                ========================================= */}

                <div
                  className="
                    max-h-[380px]
                    overflow-y-auto
                  "
                >

                  {/* Loading */}

                  {notificationsLoading ? (

                    <div className="py-10 px-4 space-y-3">

                      {Array(4)
                        .fill(0)
                        .map((_, index) => (

                          <div
                            key={index}
                            className="
                              flex
                              items-start
                              gap-3
                              animate-pulse
                            "
                          >

                            <div
                              className="
                                w-8 h-8
                                rounded-lg
                                bg-slate-200
                                dark:bg-white/10
                                flex-shrink-0
                              "
                            />

                            <div
                              className="
                                flex-1
                                space-y-2
                              "
                            >

                              <div
                                className="
                                  h-3
                                  w-28
                                  rounded
                                  bg-slate-200
                                  dark:bg-white/10
                                "
                              />

                              <div
                                className="
                                  h-2.5
                                  w-full
                                  rounded
                                  bg-slate-200
                                  dark:bg-white/10
                                "
                              />

                              <div
                                className="
                                  h-2.5
                                  w-20
                                  rounded
                                  bg-slate-200
                                  dark:bg-white/10
                                "
                              />

                            </div>

                          </div>

                        ))}

                    </div>

                  ) : notifications.length === 0 ? (

                    /* =====================================
                       EMPTY STATE
                    ===================================== */

                    <div className="py-12 text-center">

                      <div
                        className="
                          mx-auto
                          w-11 h-11
                          rounded-full
                          bg-slate-100
                          dark:bg-white/[0.05]
                          flex items-center
                          justify-center
                          text-slate-400
                        "
                      >
                        <HiOutlineBell
                          size={19}
                        />
                      </div>

                      <p
                        className="
                          text-sm
                          font-medium
                          text-slate-500
                          dark:text-slate-400
                          mt-3
                        "
                      >
                        No notifications
                      </p>

                      <p
                        className="
                          text-[11px]
                          text-slate-400
                          mt-1
                        "
                      >
                        You're all caught up!
                      </p>

                    </div>

                  ) : (

                    /* =====================================
                       NOTIFICATION ITEMS
                    ===================================== */

                    notifications.map((notification) => (

                      <div
                        key={notification._id}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`
                          px-4
                          py-3.5
                          cursor-pointer
                          border-b
                          border-slate-50
                          dark:border-white/[0.04]
                          hover:bg-slate-50
                          dark:hover:bg-white/[0.03]
                          transition-colors

                          ${
                            !notification.isRead
                              ? 'bg-indigo-50/50 dark:bg-indigo-500/[0.04]'
                              : ''
                          }
                        `}
                      >

                        <div className="flex items-start gap-3">

                          {/* Icon */}

                          <div
                            className="
                              mt-0.5
                              w-8 h-8
                              flex-shrink-0
                              rounded-lg
                              bg-indigo-50
                              dark:bg-indigo-500/10
                              text-indigo-600
                              dark:text-indigo-400
                              flex items-center
                              justify-center
                            "
                          >
                            <HiOutlineBell
                              size={15}
                            />
                          </div>


                          {/* Content */}

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-2
                              "
                            >

                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  text-slate-800
                                  dark:text-white
                                "
                              >
                                {notification.title}
                              </p>

                              {!notification.isRead && (

                                <span
                                  className="
                                    mt-1
                                    w-1.5 h-1.5
                                    rounded-full
                                    bg-indigo-500
                                    flex-shrink-0
                                  "
                                />

                              )}

                            </div>


                            <p
                              className="
                                text-xs
                                text-slate-500
                                dark:text-slate-400
                                mt-1
                                leading-relaxed
                              "
                            >
                              {notification.message}
                            </p>


                            <p
                              className="
                                text-[10px]
                                text-slate-400
                                mt-1.5
                              "
                            >
                              {formatDistanceToNow(
                                notification.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    ))

                  )}

                </div>

              </motion.div>

            )}

          </AnimatePresence>

        </div>


        {/* =================================================
            PROFILE
        ================================================= */}

        <div
          className="
            ml-1
            w-10 h-10
            rounded-xl
            flex items-center justify-center
            bg-gradient-to-br
            from-indigo-500
            to-violet-600
            text-white
            text-sm
            font-bold
            shadow-lg
            shadow-indigo-500/20
          "
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>

      </div>

    </header>
  );
}