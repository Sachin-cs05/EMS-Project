import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {type: String, unique: true, uppercase: true, trim: true, immutable: true,},
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    phone:       { type: String, required: true },
    address: {
      street:  String,
      city:    String,
      state:   String,
      zip:     String,
      country: { type: String, default: 'India' },
    },
    department:  { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true },
    salary:      { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
    profileImage:{ type: String, default: '' },
    status: {
      type:    String,
      enum:    ['active', 'inactive', 'on_leave', 'terminated'],
      default: 'active',
    },
    leaveBalance: {
      sick:    { type: Number, default: 12 },
      casual:  { type: Number, default: 12 },
      earned:  { type: Number, default: 15 },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.pre('save', async function (next) {
  if (!this.isNew || this.employeeId) return next();

  const lastEmployee = await mongoose
    .model('Employee')
    .findOne({ employeeId: /^EMP-\d+$/ })
    .sort({ employeeId: -1 })
    .select('employeeId');

  let nextNumber = 1;

  if (lastEmployee?.employeeId) {
    const lastNumber = parseInt(
      lastEmployee.employeeId.replace('EMP-', ''),
      10
    );

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  this.employeeId = `EMP-${String(nextNumber).padStart(4, '0')}`;

  next();
});

export default mongoose.model('Employee', employeeSchema);
