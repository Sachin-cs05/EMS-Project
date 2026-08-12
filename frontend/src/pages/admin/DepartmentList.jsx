import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineOfficeBuilding } from 'react-icons/hi';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../features/slices';
import { showToast } from '../../features/slices';
import { Modal, ConfirmDialog, EmptyState } from '../../components/common/index.jsx';

function DeptModal({ isOpen, onClose, dept }) {
  const dispatch    = useDispatch();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    reset(dept ? { name: dept.name, description: dept.description } : { name: '', description: '' });
  }, [dept, isOpen]);

  const onSubmit = async (data) => {
    setSaving(true);
    let res;
    if (dept) {
      res = await dispatch(updateDepartment({ id: dept._id, body: data }));
    } else {
      res = await dispatch(createDepartment(data));
    }
    setSaving(false);
    if (createDepartment.fulfilled.match(res) || updateDepartment.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: dept ? 'Department updated!' : 'Department created!' }));
      onClose();
    } else {
      dispatch(showToast({ type: 'error', message: res.payload || 'Failed' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dept ? 'Edit Department' : 'Create Department'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Department Name *</label>
          <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Engineering"
            {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Brief description…"
            {...register('description')} />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : dept ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function DepartmentList() {
  const dispatch = useDispatch();
  const { list: departments, loading } = useSelector((s) => s.departments);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editDept,   setEditDept]   = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => { dispatch(fetchDepartments()); }, []);

  const openCreate = () => { setEditDept(null); setModalOpen(true); };
  const openEdit   = (d) => { setEditDept(d);  setModalOpen(true); };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await dispatch(deleteDepartment(deleteId));
    setDeleting(false);
    setDeleteId(null);
    if (deleteDepartment.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Department deleted' }));
    } else {
      dispatch(showToast({ type: 'error', message: res.payload || 'Delete failed' }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{departments.length} active departments</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <HiOutlinePlus size={16} /> New Department
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-48" />
              <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-16" />
            </div>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments yet"
          description="Create your first department to organise employees."
          action={<button onClick={openCreate} className="btn-primary"><HiOutlinePlus size={14} /> Create Department</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <motion.div
              key={dept._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 group hover:-translate-y-0.5 hover:shadow-card-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center">
                  <HiOutlineOfficeBuilding size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(dept)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 transition-colors">
                    <HiOutlinePencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(dept._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors">
                    <HiOutlineTrash size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">{dept.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                {dept.description || 'No description provided.'}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {dept.employeeCount ?? 0} employee{dept.employeeCount !== 1 ? 's' : ''}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dept.isActive ? 'badge-green' : 'badge-gray'}`}>
                  {dept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <DeptModal isOpen={modalOpen} onClose={() => setModalOpen(false)} dept={editDept} />
      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Department?" message="This will permanently remove the department. Employees must be reassigned first." />
    </div>
  );
}
