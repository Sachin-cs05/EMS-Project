import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, enum: ['sick', 'casual', 'earned'], required: true },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    totalDays: { type: Number },
    reason:    { type: String, required: [true, 'Reason is required'], minlength: 10 },
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNote: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    this.totalDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

export default mongoose.model('Leave', leaveSchema);
