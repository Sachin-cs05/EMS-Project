import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlineFilter,
  HiOutlinePencil, HiOutlineTrash, HiOutlineEye,
} from 'react-icons/hi';
import { fetchEmployees, deleteEmployee, fetchDepartments } from '../../features/slices';
import { showToast } from '../../features/slices';
import { Badge, Avatar, Pagination, ConfirmDialog, EmptyState, SkeletonTable } from '../../components/common/index.jsx';
import { formatDate } from '../../components/common/timeUtils';

export default function EmployeeList() {
  const dispatch    = useDispatch();
  const { list: employees, pagination, loading } = useSelector((s) => s.employees);
  const { list: departments } = useSelector((s) => s.departments);

  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [department, setDepartment] = useState('');
  const [status,     setStatus]     = useState('');
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  const load = useCallback(() => {
    dispatch(fetchEmployees({ page, limit: 10, search, department, status }));
  }, [page, search, department, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { dispatch(fetchDepartments()); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await dispatch(deleteEmployee(deleteId));
    if (deleteEmployee.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Employee terminated' }));
    } else {
      dispatch(showToast({ type: 'error', message: res.payload || 'Delete failed' }));
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 saas-page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Workspace
          </div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-description">Manage your organization's employees.</p>
        </div>
        <Link to="/admin/employees/add" className="saas-btn-primary self-start sm:self-auto">
          <HiOutlinePlus size={16} /> Add Employee
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          ['Total Employees', pagination?.total || 0, 'All records'],
          ['Showing', employees.length, 'Current filters'],
          ['Current Page', page, `of ${pagination?.totalPages || 1}`],
        ].map(([label, value, note]) => (
          <div key={label} className="saas-stat">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
            <p className="mt-1 text-[11px] text-slate-400">{note}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="saas-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <HiOutlineSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, designation…"
            className="saas-input pl-9"
          />
        </div>
        <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="select w-full sm:w-44">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="select w-full sm:w-36">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
          <option value="terminated">Terminated</option>
        </select>
        {(search || department || status) && (
          <button onClick={() => { setSearch(''); setDepartment(''); setStatus(''); setPage(1); }}
            className="btn-ghost text-gray-500">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={8} /></div>
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="Try adjusting your search or filters, or add a new employee."
            action={<Link to="/admin/employees/add" className="btn-primary"><HiOutlinePlus size={14} /> Add Employee</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th className="hidden md:table-cell">ID</th>
                  <th className="hidden sm:table-cell">Department</th>
                  <th className="hidden lg:table-cell">Designation</th>
                  <th className="hidden xl:table-cell">Joined</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.profileImage} name={emp.firstName} size="md" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{emp.employeeId}</span>
                    </td>
                    <td className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {emp.department?.name || '—'}
                    </td>
                    <td className="hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {emp.designation}
                    </td>
                    <td className="hidden xl:table-cell text-xs text-gray-500">
                      {formatDate(emp.joiningDate)}
                    </td>
                    <td><Badge status={emp.status} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/employees/${emp._id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors"
                          title="View">
                          <HiOutlineEye size={16} />
                        </Link>
                        <Link to={`/admin/employees/${emp._id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 transition-colors"
                          title="Edit">
                          <HiOutlinePencil size={16} />
                        </Link>
                        <button onClick={() => setDeleteId(emp._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors"
                          title="Delete">
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/10">
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Terminate Employee?"
        message="This will deactivate the employee's account. This action can be reversed by reactivating them."
      />
    </div>
  );
}
