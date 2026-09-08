// ════════════════════════════════════════════════════════════════════════════
//  AddEmployee.jsx
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiOutlinePhotograph, HiOutlineUser } from 'react-icons/hi';
import { createEmployee } from '../../features/slices';
import { fetchDepartments } from '../../features/slices';
import { showToast } from '../../features/slices';

function FormSection({ title, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2
                     border-b border-gray-100 dark:border-white/10">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children, full }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function AddEmployee() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { list: departments } = useSelector((s) => s.departments);
  const [preview,  setPreview]  = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { joiningDate: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => { dispatch(fetchDepartments()); }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'address') {
        Object.entries(v || {}).forEach(([ak, av]) => fd.append(`address[${ak}]`, av));
      } else if (k !== 'profileImage') {
        fd.append(k, v);
      }
    });
    if (fileRef.current?.files[0]) fd.append('profileImage', fileRef.current.files[0]);

    const res = await dispatch(createEmployee(fd));
    setSubmitting(false);
    if (createEmployee.fulfilled.match(res)) {
      dispatch(showToast({ type: 'success', message: 'Employee created successfully!' }));
      navigate('/admin/employees');
    } else {
      dispatch(showToast({ type: 'error', message: res.payload || 'Failed to create employee' }));
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/employees" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
          <HiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Add Employee</h1>
          <p className="page-subtitle">Create a new employee account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Profile image */}
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Profile Photo
          </h3>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <HiOutlineUser size={32} className="text-gray-300" />
              }
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="btn-secondary gap-2">
                <HiOutlinePhotograph size={16} /> Upload Photo
              </button>
              <p className="text-xs text-gray-400 mt-1.5">JPEG, PNG or WebP · Max 5 MB</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          </div>
        </div>

        {/* Personal info */}
        <FormSection title="Personal Information">
          <Field label="First Name *" error={errors.firstName?.message}>
            <input className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="John"
              {...register('firstName', { required: 'First name is required' })} />
          </Field>
          <Field label="Last Name *" error={errors.lastName?.message}>
            <input className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Doe"
              {...register('lastName', { required: 'Last name is required' })} />
          </Field>
          <Field label="Email Address *" error={errors.email?.message}>
            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="john@company.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })} />
          </Field>
          <Field label="Phone Number *" error={errors.phone?.message}>
            <input className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="+91 98765 43210"
              {...register('phone', { required: 'Phone is required' })} />
          </Field>
        </FormSection>

        {/* Address */}
        <FormSection title="Address">
          <Field label="Street" error={errors.address?.street?.message} full>
            <input className="input" placeholder="123 Main Street"
              {...register('address.street')} />
          </Field>
          <Field label="City" error={errors.address?.city?.message}>
            <input className="input" placeholder="Mumbai"
              {...register('address.city')} />
          </Field>
          <Field label="State" error={errors.address?.state?.message}>
            <input className="input" placeholder="Maharashtra"
              {...register('address.state')} />
          </Field>
          <Field label="ZIP Code" error={errors.address?.zip?.message}>
            <input className="input" placeholder="400001"
              {...register('address.zip')} />
          </Field>
          <Field label="Country" error={errors.address?.country?.message}>
            <input className="input" placeholder="India"
              {...register('address.country')} />
          </Field>
        </FormSection>

        {/* Employment */}
        <FormSection title="Employment Details">
          <Field label="Department *" error={errors.department?.message}>
            <select className={`select ${errors.department ? 'input-error' : ''}`}
              {...register('department', { required: 'Department is required' })}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Designation *" error={errors.designation?.message}>
            <input className={`input ${errors.designation ? 'input-error' : ''}`} placeholder="Software Engineer"
              {...register('designation', { required: 'Designation is required' })} />
          </Field>
          <Field label="Salary (₹) *" error={errors.salary?.message}>
            <input type="number" className={`input ${errors.salary ? 'input-error' : ''}`} placeholder="50000"
              {...register('salary', { required: 'Salary is required', min: { value: 0, message: 'Must be positive' } })} />
          </Field>
          <Field label="Joining Date *" error={errors.joiningDate?.message}>
            <input type="date" className={`input ${errors.joiningDate ? 'input-error' : ''}`}
              {...register('joiningDate', { required: 'Joining date is required' })} />
          </Field>
        </FormSection>

        {/* Account */}
        <FormSection title="Account Credentials">
          <Field label="Initial Password *" error={errors.password?.message}>
            <input type="password" className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="At least 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
                validate: (value) =>
                  /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) ||
                  'Use uppercase, lowercase, and a number',
              })} />
          </Field>
          <div className="flex items-end pb-1">
            <p className="text-xs text-gray-400">
              Employee will receive login credentials via email and must change password on first login.
            </p>
          </div>
        </FormSection>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link to="/admin/employees" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary px-8">
            {submitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
              : 'Create Employee'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEmployee;
