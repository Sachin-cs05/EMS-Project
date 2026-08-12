import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, 'Department name is required'], unique: true, trim: true },
    description: { type: String, trim: true },
    head:        { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

departmentSchema.virtual('employeeCount', {
  ref:          'Employee',
  localField:   '_id',
  foreignField: 'department',
  count:        true,
});

export default mongoose.model('Department', departmentSchema);
