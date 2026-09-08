import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useDashboard } from '../../hooks/useDashboard';

import {
  SkeletonCard,
  Badge,
  Avatar,
} from '../../components/common/index.jsx';

import { formatDate } from '../../components/common/timeUtils';

import DepartmentPieChart from '../../components/charts/DepartmentPieChart';
import AttendanceTrendChart from '../../components/charts/AttendanceTrendChart';
import EmployeeGrowthChart from '../../components/charts/EmployeeGrowthChart';
import LeaveStatsChart from '../../components/charts/LeaveStatsChart';

import {
  HiOutlineUsers,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';


/* =========================================================
   ANIMATION
========================================================= */

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },

  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.35,
      ease: 'easeOut',
    },
  }),
};


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  loading,
  index,
}) {
  const styles = {
    blue: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
      icon: 'text-indigo-600 dark:text-indigo-400',
      glow: 'group-hover:shadow-indigo-500/10',
    },

    green: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      icon: 'text-emerald-600 dark:text-emerald-400',
      glow: 'group-hover:shadow-emerald-500/10',
    },

    purple: {
      iconBg: 'bg-violet-50 dark:bg-violet-500/10',
      icon: 'text-violet-600 dark:text-violet-400',
      glow: 'group-hover:shadow-violet-500/10',
    },

    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-500/10',
      icon: 'text-amber-600 dark:text-amber-400',
      glow: 'group-hover:shadow-amber-500/10',
    },
  };

  const style = styles[color];

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`
        group
        relative
        overflow-hidden
        bg-white
        dark:bg-[#15171d]
        border
        border-slate-200/80
        dark:border-white/[0.06]
        rounded-2xl
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        ${style.glow}
      `}
    >
      <div
        className="
          absolute
          -right-8
          -top-8
          w-24
          h-24
          rounded-full
          bg-indigo-500/[0.03]
          dark:bg-indigo-400/[0.04]
          blur-2xl
          transition-all
          duration-300
          group-hover:scale-150
        "
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={`
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
              ${style.iconBg}
              transition-transform
              duration-300
              group-hover:scale-110
            `}
          >
            <Icon
              size={21}
              className={style.icon}
            />
          </div>

          <span
            className="
              inline-flex
              items-center
              gap-1.5
              px-2
              py-1
              rounded-lg
              bg-emerald-50
              dark:bg-emerald-500/10
              text-emerald-600
              dark:text-emerald-400
              text-[10px]
              font-semibold
            "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        <div className="mt-5">
          <p
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            {value ?? '—'}
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-slate-700
              dark:text-slate-200
            "
          >
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}


/* =========================================================
   ATTENDANCE ITEM
========================================================= */

function AttendanceItem({
  label,
  value,
  type,
}) {
  const config = {
    present: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/[0.07]',
      icon: HiOutlineCheckCircle,
      iconColor: 'text-emerald-500',
    },

    absent: {
      bg: 'bg-red-50 dark:bg-red-500/[0.07]',
      icon: HiOutlineExclamationCircle,
      iconColor: 'text-red-500',
    },

    late: {
      bg: 'bg-amber-50 dark:bg-amber-500/[0.07]',
      icon: HiOutlineClock,
      iconColor: 'text-amber-500',
    },

    half: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/[0.07]',
      icon: HiOutlineCalendar,
      iconColor: 'text-indigo-500',
    },
  };

  const item = config[type];
  const Icon = item.icon;

  return (
    <div
      className={`
        ${item.bg}
        rounded-xl
        px-4
        py-3
        flex
        items-center
        justify-between
        transition-all
        duration-200
        hover:scale-[1.01]
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className="
            w-8
            h-8
            rounded-lg
            bg-white/70
            dark:bg-white/[0.04]
            flex
            items-center
            justify-center
          "
        >
          <Icon
            size={16}
            className={item.iconColor}
          />
        </div>

        <div>
          <p
            className="
              text-xs
              font-medium
              text-slate-500
              dark:text-slate-400
            "
          >
            {label}
          </p>
        </div>
      </div>

      <p
        className="
          text-lg
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        {value ?? 0}
      </p>
    </div>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  subtitle,
  link,
  linkText = 'View all',
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        mb-5
      "
    >
      <div>
        <h2
          className="
            text-sm
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            {subtitle}
          </p>
        )}
      </div>

      {link && (
        <Link
          to={link}
          className="
            flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-indigo-600
            dark:text-indigo-400
            hover:text-indigo-700
            dark:hover:text-indigo-300
            transition-colors
          "
        >
          {linkText}

          <HiOutlineArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}


/* =========================================================
   LOADING ITEM
========================================================= */

function ActivitySkeleton({ badge = false }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        p-3
        rounded-xl
        animate-pulse
      "
    >
      <div
        className="
          w-10
          h-10
          rounded-full
          bg-slate-200
          dark:bg-white/10
        "
      />

      <div className="flex-1 space-y-2">
        <div
          className="
            h-3
            bg-slate-200
            dark:bg-white/10
            rounded
            w-32
          "
        />

        <div
          className="
            h-2.5
            bg-slate-200
            dark:bg-white/10
            rounded
            w-24
          "
        />
      </div>

      {badge && (
        <div
          className="
            w-14
            h-5
            rounded-full
            bg-slate-200
            dark:bg-white/10
          "
        />
      )}
    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const {
    stats,
    charts,
    activity,
    statsLoading,
    chartsLoading,
    activityLoading,
  } = useDashboard();


  /* =======================================================
     STAT CARDS
  ======================================================= */

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees,
      subtitle: 'All employees in organization',
      icon: HiOutlineUsers,
      color: 'blue',
    },

    {
      title: 'Active Employees',
      value: stats?.activeEmployees,
      subtitle: 'Currently working',
      icon: HiOutlineUserGroup,
      color: 'green',
    },

    {
      title: 'Departments',
      value: stats?.totalDepartments,
      subtitle: 'Active teams',
      icon: HiOutlineOfficeBuilding,
      color: 'purple',
    },

    {
      title: 'Pending Leaves',
      value: stats?.pendingLeaves,
      subtitle: 'Requests waiting for review',
      icon: HiOutlineClipboardList,
      color: 'amber',
    },
  ];


  return (
    <div className="space-y-7 saas-page-enter">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-2.5
              py-1
              rounded-lg
              bg-indigo-50
              dark:bg-indigo-500/10
              text-indigo-600
              dark:text-indigo-400
              text-[10px]
              font-semibold
              mb-2
            "
          >
            <span
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-indigo-500
              "
            />

            Admin Workspace
          </div>

          <h1
            className="
              text-2xl
              md:text-3xl
              font-bold
              tracking-tight
              text-slate-900
              dark:text-white
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Welcome back! Here's what's happening
            in your organization today.
          </p>
        </div>

        <Link
          to="/admin/employees/add"
          className="
            saas-btn-primary
            self-start
            sm:self-auto
          "
        >
          <HiOutlinePlus size={17} />

          Add Employee
        </Link>
      </motion.div>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >
        {statCards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            loading={statsLoading}
            index={index}
          />
        ))}
      </div>


      {/* =====================================================
          ATTENDANCE
      ===================================================== */}

      {stats?.todayAttendance && (
        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="
            saas-card
            p-5
            md:p-6
          "
        >
          <SectionHeader
            title="Today's Attendance"
            subtitle="Real-time attendance overview"
          />

          <div
            className="
              grid
              grid-cols-2
              lg:grid-cols-4
              gap-3
            "
          >
            <AttendanceItem
              label="Present"
              value={stats.todayAttendance.present}
              type="present"
            />

            <AttendanceItem
              label="Absent"
              value={stats.todayAttendance.absent}
              type="absent"
            />

            <AttendanceItem
              label="Late"
              value={stats.todayAttendance.late}
              type="late"
            />

            <AttendanceItem
              label="Half Day"
              value={stats.todayAttendance.halfDay}
              type="half"
            />
          </div>
        </motion.div>
      )}


      {/* =====================================================
          CHARTS ROW 1
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-5
          gap-4
        "
      >

        {/* Employee Growth */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
          }}
          className="
            xl:col-span-3
            saas-card
            p-5
            md:p-6
          "
        >
          <SectionHeader
            title="Employee Growth"
            subtitle="Employee count over time"
          />

          <div className="h-[300px]">
            <EmployeeGrowthChart
              data={charts?.growth}
              loading={chartsLoading}
            />
          </div>
        </motion.div>


        {/* Department */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.42,
          }}
          className="
            xl:col-span-2
            saas-card
            p-5
            md:p-6
          "
        >
          <SectionHeader
            title="Department Distribution"
            subtitle="Employees by department"
          />

          <div className="h-[300px]">
            <DepartmentPieChart
              data={charts?.deptWise}
              loading={chartsLoading}
            />
          </div>
        </motion.div>
      </div>


      {/* =====================================================
          CHARTS ROW 2
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-4
        "
      >

        {/* Attendance Trend */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.48,
          }}
          className="
            saas-card
            p-5
            md:p-6
          "
        >
          <SectionHeader
            title="Attendance Trend"
            subtitle="Last 7 days"
          />

          <div className="h-[300px]">
            <AttendanceTrendChart
              data={charts?.attendanceTrend}
              loading={chartsLoading}
            />
          </div>
        </motion.div>


        {/* Leave Statistics */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.55,
          }}
          className="
            saas-card
            p-5
            md:p-6
          "
        >
          <SectionHeader
            title="Leave Statistics"
            subtitle="Leave requests overview"
          />

          <div className="h-[300px]">
            <LeaveStatsChart
              data={charts?.leaveStats}
              loading={chartsLoading}
            />
          </div>
        </motion.div>
      </div>


      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-4
        "
      >

        {/* Recent Hires */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          className="
            saas-card
            p-5
            md:p-6
          "
        >
          <SectionHeader
            title="Recent Hires"
            subtitle="Latest employees added"
            link="/admin/employees"
          />

          <div className="space-y-2">
            {activityLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <ActivitySkeleton key={i} />
                ))
            ) : activity?.recentHires?.length > 0 ? (
              activity.recentHires.map((emp) => (
                <div
                  key={emp._id}
                  className="
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-xl
                    hover:bg-slate-50
                    dark:hover:bg-white/[0.03]
                    transition-colors
                  "
                >
                  <Avatar
                    src={emp.profileImage}
                    name={emp.firstName}
                    size="md"
                  />

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-800
                        dark:text-white
                        truncate
                      "
                    >
                      {emp.firstName} {emp.lastName}
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        truncate
                        mt-0.5
                      "
                    >
                      {emp.designation}
                      {' · '}
                      {emp.department?.name || 'No department'}
                    </p>
                  </div>

                  <p
                    className="
                      text-[11px]
                      text-slate-400
                      flex-shrink-0
                    "
                  >
                    {formatDate(emp.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div
                className="
                  py-8
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                No recent hires
              </div>
            )}
          </div>
        </motion.div>


        {/* Recent Leaves */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.65,
          }}
          className="
            saas-card
            p-5
            md:p-6
          "
        >
          <SectionHeader
            title="Recent Leave Requests"
            subtitle="Latest leave applications"
            link="/admin/leaves"
          />

          <div className="space-y-2">
            {activityLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <ActivitySkeleton
                    key={i}
                    badge
                  />
                ))
            ) : activity?.recentLeaves?.length > 0 ? (
              activity.recentLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-xl
                    hover:bg-slate-50
                    dark:hover:bg-white/[0.03]
                    transition-colors
                  "
                >
                  <Avatar
                    src={leave.employee?.profileImage}
                    name={leave.employee?.firstName}
                    size="md"
                  />

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-800
                        dark:text-white
                        truncate
                      "
                    >
                      {leave.employee?.firstName}{' '}
                      {leave.employee?.lastName}
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-0.5
                      "
                    >
                      {leave.leaveType}
                      {' · '}
                      {leave.totalDays}
                      {' day(s)'}
                    </p>
                  </div>

                  <Badge status={leave.status} />
                </div>
              ))
            ) : (
              <div
                className="
                  py-8
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                No recent leave requests
              </div>
            )}
          </div>
        </motion.div>
      </div>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.7,
        }}
        className="
          saas-card
          p-5
          md:p-6
        "
      >
        <SectionHeader
          title="Quick Actions"
          subtitle="Frequently used actions"
        />

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-3
          "
        >

          {/* Add Employee */}

          <Link
            to="/admin/employees/add"
            className="
              group
              flex
              items-center
              gap-3
              p-4
              rounded-xl
              border
              border-slate-100
              dark:border-white/[0.05]
              hover:border-indigo-200
              dark:hover:border-indigo-500/20
              hover:bg-indigo-50/50
              dark:hover:bg-indigo-500/[0.04]
              transition-all
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-indigo-50
                dark:bg-indigo-500/10
                text-indigo-600
                dark:text-indigo-400
                flex
                items-center
                justify-center
                group-hover:scale-105
                transition-transform
              "
            >
              <HiOutlinePlus size={19} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-white
                "
              >
                Add Employee
              </p>

              <p
                className="
                  text-[11px]
                  text-slate-400
                  mt-0.5
                "
              >
                Create employee profile
              </p>
            </div>
          </Link>


          {/* Manage Employees */}

          <Link
            to="/admin/employees"
            className="
              group
              flex
              items-center
              gap-3
              p-4
              rounded-xl
              border
              border-slate-100
              dark:border-white/[0.05]
              hover:border-indigo-200
              dark:hover:border-indigo-500/20
              hover:bg-indigo-50/50
              dark:hover:bg-indigo-500/[0.04]
              transition-all
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-violet-50
                dark:bg-violet-500/10
                text-violet-600
                dark:text-violet-400
                flex
                items-center
                justify-center
                group-hover:scale-105
                transition-transform
              "
            >
              <HiOutlineUsers size={19} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-white
                "
              >
                Manage Employees
              </p>

              <p
                className="
                  text-[11px]
                  text-slate-400
                  mt-0.5
                "
              >
                View employee directory
              </p>
            </div>
          </Link>


          {/* Attendance */}

          <Link
            to="/admin/attendance"
            className="
              group
              flex
              items-center
              gap-3
              p-4
              rounded-xl
              border
              border-slate-100
              dark:border-white/[0.05]
              hover:border-indigo-200
              dark:hover:border-indigo-500/20
              hover:bg-indigo-50/50
              dark:hover:bg-indigo-500/[0.04]
              transition-all
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-emerald-50
                dark:bg-emerald-500/10
                text-emerald-600
                dark:text-emerald-400
                flex
                items-center
                justify-center
                group-hover:scale-105
                transition-transform
              "
            >
              <HiOutlineCalendar size={19} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-white
                "
              >
                Attendance
              </p>

              <p
                className="
                  text-[11px]
                  text-slate-400
                  mt-0.5
                "
              >
                Manage attendance
              </p>
            </div>
          </Link>


          {/* Leave Requests */}

          <Link
            to="/admin/leaves"
            className="
              group
              flex
              items-center
              gap-3
              p-4
              rounded-xl
              border
              border-slate-100
              dark:border-white/[0.05]
              hover:border-indigo-200
              dark:hover:border-indigo-500/20
              hover:bg-indigo-50/50
              dark:hover:bg-indigo-500/[0.04]
              transition-all
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-amber-50
                dark:bg-amber-500/10
                text-amber-600
                dark:text-amber-400
                flex
                items-center
                justify-center
                group-hover:scale-105
                transition-transform
              "
            >
              <HiOutlineClipboardList size={19} />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  dark:text-white
                "
              >
                Leave Requests
              </p>

              <p
                className="
                  text-[11px]
                  text-slate-400
                  mt-0.5
                "
              >
                Review leave requests
              </p>
            </div>
          </Link>

        </div>
      </motion.div>

    </div>
  );
}