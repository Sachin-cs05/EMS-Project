// ════════════════════════════════════════════════════════════════════════════
//  Analytics.jsx  — /admin/analytics
// ════════════════════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../hooks/useDashboard';
import { EmployeeGrowthChart } from '../../components/charts/index.jsx';
import { DepartmentPieChart }  from '../../components/charts/index.jsx';
import { AttendanceTrendChart } from '../../components/charts/index.jsx';
import { LeaveStatsChart }     from '../../components/charts/index.jsx';

export function Analytics() {
  const { charts, chartsLoading, stats, statsLoading } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Visual insights about your workforce</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees',  value: stats?.totalEmployees,   color: 'bg-blue-500' },
          { label: 'Active',           value: stats?.activeEmployees,  color: 'bg-green-500' },
          { label: 'Departments',      value: stats?.totalDepartments, color: 'bg-purple-500' },
          { label: 'Pending Leaves',   value: stats?.pendingLeaves,    color: 'bg-amber-500' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-black text-sm">{value ?? '—'}</span>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Employee Growth</h2>
          <EmployeeGrowthChart data={charts?.growth} loading={chartsLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Department Distribution</h2>
          <DepartmentPieChart data={charts?.deptWise} loading={chartsLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Attendance Trend (7 days)</h2>
          <AttendanceTrendChart data={charts?.attendanceTrend} loading={chartsLoading} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leave Type Breakdown</h2>
          <LeaveStatsChart data={charts?.leaveStats} loading={chartsLoading} />
        </motion.div>
      </div>
    </div>
  );
}

export default Analytics;
