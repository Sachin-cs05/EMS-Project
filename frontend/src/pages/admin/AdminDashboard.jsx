import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineUserGroup,
  HiOutlineClipboardList, HiOutlinePlus, HiOutlineArrowRight,
} from 'react-icons/hi';
import { useDashboard } from '../../hooks/useDashboard';
import { SkeletonCard } from '../../components/common/index.jsx';
import { Badge, Avatar } from '../../components/common/index.jsx';
import { formatDate } from '../../components/common/timeUtils';
import DepartmentPieChart    from '../../components/charts/DepartmentPieChart';
import AttendanceTrendChart  from '../../components/charts/AttendanceTrendChart';
import EmployeeGrowthChart   from '../../components/charts/EmployeeGrowthChart';
import LeaveStatsChart       from '../../components/charts/LeaveStatsChart';

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

function StatCard({ title, value, subtitle, icon: Icon, color, loading, index }) {
  const colorMap = {
    blue:   'from-blue-500   to-blue-600',
    green:  'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber:  'from-amber-500  to-amber-600',
  };
  const bgMap = {
    blue:   'bg-blue-50   dark:bg-blue-500/10',
    green:  'bg-emerald-50 dark:bg-emerald-500/10',
    purple: 'bg-purple-50 dark:bg-purple-500/10',
    amber:  'bg-amber-50  dark:bg-amber-500/10',
  };
  const textMap = {
    blue:   'text-blue-600   dark:text-blue-400',
    green:  'text-emerald-600 dark:text-emerald-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber:  'text-amber-600  dark:text-amber-400',
  };

  if (loading) return <SkeletonCard />;

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      className="stat-card group cursor-default">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl ${bgMap[color]} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={20} className={textMap[color]} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bgMap[color]} ${textMap[color]}`}>
          Live
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-black text-gray-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { stats, charts, activity, statsLoading, chartsLoading, activityLoading } = useDashboard();

  const statCards = [
    { title: 'Total Employees',   value: stats?.totalEmployees,   subtitle: 'All time',          icon: HiOutlineUsers,          color: 'blue'   },
    { title: 'Active Employees',  value: stats?.activeEmployees,  subtitle: 'Currently working', icon: HiOutlineUserGroup,      color: 'green'  },
    { title: 'Departments',       value: stats?.totalDepartments, subtitle: 'Active teams',      icon: HiOutlineOfficeBuilding, color: 'purple' },
    { title: 'Pending Leaves',    value: stats?.pendingLeaves,    subtitle: 'Needs review',      icon: HiOutlineClipboardList,  color: 'amber'  },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <Link to="/admin/employees/add" className="btn-primary">
          <HiOutlinePlus size={16} /> Add Employee
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <StatCard key={c.title} {...c} loading={statsLoading} index={i} />
        ))}
      </div>

      {/* Attendance quick summary */}
      {stats?.todayAttendance && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Today's Attendance Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Present',  value: stats.todayAttendance.present,  color: 'bg-green-500'  },
              { label: 'Absent',   value: stats.todayAttendance.absent,   color: 'bg-red-500'    },
              { label: 'Late',     value: stats.todayAttendance.late,     color: 'bg-yellow-500' },
              { label: 'Half Day', value: stats.todayAttendance.halfDay,  color: 'bg-blue-500'   },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Employee Growth</h2>
          <EmployeeGrowthChart data={charts?.growth} loading={chartsLoading} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Department Distribution</h2>
          <DepartmentPieChart data={charts?.deptWise} loading={chartsLoading} />
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Attendance Trend (7 days)</h2>
          <AttendanceTrendChart data={charts?.attendanceTrend} loading={chartsLoading} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leave Statistics</h2>
          <LeaveStatsChart data={charts?.leaveStats} loading={chartsLoading} />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent hires */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Hires</h2>
            <Link to="/admin/employees" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <HiOutlineArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {activityLoading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
                      <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded w-20" />
                    </div>
                  </div>
                ))
              : activity?.recentHires?.map((emp) => (
                  <div key={emp._id} className="flex items-center gap-3">
                    <Avatar src={emp.profileImage} name={emp.firstName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{emp.designation} · {emp.department?.name}</p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(emp.createdAt)}</p>
                  </div>
                ))
            }
          </div>
        </motion.div>

        {/* Recent leaves */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Leave Requests</h2>
            <Link to="/admin/leaves" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <HiOutlineArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {activityLoading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
                      <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded w-20" />
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
                  </div>
                ))
              : activity?.recentLeaves?.map((leave) => (
                  <div key={leave._id} className="flex items-center gap-3">
                    <Avatar src={leave.employee?.profileImage} name={leave.employee?.firstName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{leave.leaveType} · {leave.totalDays} day(s)</p>
                    </div>
                    <Badge status={leave.status} />
                  </div>
                ))
            }
          </div>
        </motion.div>
      </div>
    </div>
  );
}
