// ════════════════════════════════════════════════════════════════════════════
//  EmployeeProfile.jsx  — /admin/employees/:id
// ════════════════════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiOutlinePencil, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineCurrencyRupee } from 'react-icons/hi';
import { fetchEmployee } from '../../features/slices';
import { Badge, Avatar, SkeletonCard } from '../../components/common/index.jsx';
import { formatDate } from '../../components/common/timeUtils';

export function EmployeeProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: emp, loading, error } = useSelector((s) => s.employees);

  useEffect(() => { dispatch(fetchEmployee(id)); }, [id]);

  if (loading || (!emp && !error)) {
    return <div className="grid grid-cols-2 gap-4 max-w-4xl">{Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>;
  }

  if (error || !emp) {
    return (
      <div className="card max-w-4xl p-6 text-sm text-gray-500 dark:text-gray-400">
        {error || 'Employee not found'}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/employees" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
            <HiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="page-title">Employee Profile</h1>
            <p className="page-subtitle">{emp.employeeId}</p>
          </div>
        </div>
        <Link to={`/admin/employees/${id}/edit`} className="btn-primary">
          <HiOutlinePencil size={16} /> Edit
        </Link>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar src={emp.profileImage} name={emp.firstName} size="xl" />
        <div className="flex-1">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            {emp.firstName} {emp.lastName}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{emp.designation} · {emp.department?.name}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge status={emp.status} />
            <span className="badge badge-gray">{emp.employeeId}</span>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Joined</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatDate(emp.joiningDate)}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contact info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Information</h3>
          {[
            { icon: HiOutlineMail,            label: 'Email',   value: emp.email },
            { icon: HiOutlinePhone,           label: 'Phone',   value: emp.phone },
            { icon: HiOutlineLocationMarker,  label: 'Address', value: [emp.address?.street, emp.address?.city, emp.address?.state, emp.address?.country].filter(Boolean).join(', ') || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Employment */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Employment Details</h3>
          {[
            { icon: HiOutlineCalendar,      label: 'Joining Date', value: formatDate(emp.joiningDate) },
            { icon: HiOutlineCurrencyRupee, label: 'Salary',       value: `₹${emp.salary?.toLocaleString('en-IN')}` },
            { icon: HiOutlineMail,          label: 'Department',   value: emp.department?.name || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-gray-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Leave balance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-5 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leave Balance</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: 'sick',   label: 'Sick Leave',   color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-500/10' },
              { type: 'casual', label: 'Casual Leave', color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { type: 'earned', label: 'Earned Leave', color: 'text-green-600 dark:text-green-400',bg: 'bg-green-50 dark:bg-green-500/10' },
            ].map(({ type, label, color, bg }) => (
              <div key={type} className={`${bg} rounded-2xl p-4 text-center`}>
                <p className={`text-3xl font-black ${color}`}>{emp.leaveBalance?.[type] ?? '—'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EmployeeProfile;
