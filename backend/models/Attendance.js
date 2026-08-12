import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date:      { type: Date, required: true },
    checkIn:   { type: Date, default: null },
    checkOut:  { type: Date, default: null },
    status: {
      type:    String,
      enum:    ['present', 'absent', 'late', 'half_day', 'holiday'],
      default: 'absent',
    },
    workHours: { type: Number, default: 0 },
    note:      { type: String, default: '' },
    markedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.workHours = Math.round(diff * 100) / 100;
    if (diff >= 8)       this.status = 'present';
    else if (diff >= 4)  this.status = 'half_day';
    else                 this.status = 'late';
  }
  next();
});

export default mongoose.model('Attendance', attendanceSchema);
