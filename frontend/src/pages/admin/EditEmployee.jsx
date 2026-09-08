import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiOutlinePhotograph } from 'react-icons/hi';
import { fetchEmployee, updateEmployee, fetchDepartments } from '../../features/slices';
import { showToast } from '../../features/slices';
import { Avatar, SkeletonCard } from '../../components/common/index.jsx';

function Field({ label, error, children, full }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function EditEmployee() {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { selected: employee, loading, error } = useSelector((s) => s.employees);
  const { list: departments }           = useSelector((s) => s.departments);
  const [preview,    setPreview]    = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    dispatch(fetchEmployee(id));
    dispatch(fetchDepartments());
  }, [id]);

  useEffect(() => {
    if (employee) {
      reset({
        firstName:   employee.firstName,
        lastName:    employee.lastName,
        phone:       employee.phone,
        designation: employee.designation,
        salary:      employee.salary,
        status:      employee.status,
        department:  employee.department?._id || employee.department,
        joiningDate: employee.joiningDate?.slice(0, 10),
        address:     employee.address || {},
      });
      setPreview(employee.profileImage || null);
    }
  }, [employee]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'address') {
        Object.entries(v || {}).forEach(([ak, av]) => fd.append(`address[${ak}]`, av || ''));
      } else {
        fd.append(k, v);
      }
    });
    if (fileRef.current?.files[0]) fd.append('profileImage', fileRef.current.files[0]);

    const res = await dispatch(updateEmployee({ id, formData: fd }));
    setSubmitting(false);
    if (updateEmployee.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Employee updated!' }));
      navigate(`/admin/employees/${id}`);
    } else {
      dispatch(showToast({ type: 'error', message: res.payload || 'Update failed' }));
    }
  };

  if (loading || (!employee && !error)) {
    return <div className="grid grid-cols-2 gap-4 max-w-3xl">{Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>;
  }

  if (error || !employee) {
    return (
      <div className="card max-w-3xl p-6 text-sm text-gray-500 dark:text-gray-400">
        {error || 'Employee not found'}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to={`/admin/employees/${id}`} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
          <HiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Edit Employee</h1>
          <p className="page-subtitle">{employee?.firstName} {employee?.lastName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Photo */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Profile Photo</h3>
          <div className="flex items-center gap-5">
            {preview
              ? <img src={preview} alt="preview" className="w-20 h-20 rounded-2xl object-cover" />
              : <Avatar name={employee?.firstName} size="xl" />
            }
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
                <HiOutlinePhotograph size={16} /> Change Photo
              </button>
              <p className="text-xs text-gray-400 mt-1.5">JPEG, PNG or WebP · Max 5 MB</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          </div>
        </div>

        {/* Personal */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-white/10">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name *" error={errors.firstName?.message}>
              <input className={`input ${errors.firstName ? 'input-error' : ''}`}
                {...register('firstName', { required: 'Required' })} />
            </Field>
            <Field label="Last Name *" error={errors.lastName?.message}>
              <input className={`input ${errors.lastName ? 'input-error' : ''}`}
                {...register('lastName', { required: 'Required' })} />
            </Field>
            <Field label="Phone *" error={errors.phone?.message}>
              <input className={`input ${errors.phone ? 'input-error' : ''}`}
                {...register('phone', { required: 'Required' })} />
            </Field>
            <Field label="Status" error={errors.status?.message}>
              <select className="select" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-white/10">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Street" full><input className="input" {...register('address.street')} /></Field>
            <Field label="City"><input className="input" {...register('address.city')} /></Field>
            <Field label="State"><input className="input" {...register('address.state')} /></Field>
            <Field label="ZIP"><input className="input" {...register('address.zip')} /></Field>
            <Field label="Country"><input className="input" {...register('address.country')} /></Field>
          </div>
        </div>

        {/* Employment */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-100 dark:border-white/10">Employment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Department *" error={errors.department?.message}>
              <select className="select" {...register('department', { required: 'Required' })}>
                <option value="">Select</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Designation *" error={errors.designation?.message}>
              <input className={`input ${errors.designation ? 'input-error' : ''}`}
                {...register('designation', { required: 'Required' })} />
            </Field>
            <Field label="Salary (₹) *" error={errors.salary?.message}>
              <input type="number" className="input"
                {...register('salary', { required: 'Required', min: 0 })} />
            </Field>
            <Field label="Joining Date" error={errors.joiningDate?.message}>
              <input type="date" className="input" {...register('joiningDate')} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to={`/admin/employees/${id}`} className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary px-8">
            {submitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : 'Save Changes'
            }
          </button>
        </div>
      </form>
    </div>
  );
}
