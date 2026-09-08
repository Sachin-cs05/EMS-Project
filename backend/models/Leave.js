import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },

    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'earned'],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      min: 1,
    },

    reason: {
      type: String,
      required: [true, 'Reason is required'],
      minlength: [10, 'Reason must be at least 10 characters'],
      trim: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewNote: {
      type: String,
      default: '',
      trim: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

leaveSchema.pre('validate', function (next) {
  if (!this.startDate || !this.endDate) {
    return next();
  }

  if (this.endDate < this.startDate) {
    return next(
      new Error('End date cannot be before start date')
    );
  }

  const diff =
    this.endDate.getTime() - this.startDate.getTime();

  this.totalDays =
    Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

  next();
});

leaveSchema.index({
  employee: 1,
  startDate: 1,
  endDate: 1,
});

leaveSchema.index({
  employee: 1,
  status: 1,
});

leaveSchema.index({
  status: 1,
  createdAt: -1,
});

export default mongoose.model('Leave', leaveSchema);