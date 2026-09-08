import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        'present',
        'absent',
        'late',
        'half_day',
        'holiday',
      ],
      default: 'absent',
    },

    workHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    note: {
      type: String,
      trim: true,
      default: '',
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One attendance record per employee per day
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

// Calculate work hours automatically
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff =
      (this.checkOut.getTime() - this.checkIn.getTime()) /
      (1000 * 60 * 60);

    if (diff < 0) {
      return next(
        new Error('Check-out time cannot be before check-in time')
      );
    }

    this.workHours = Math.round(diff * 100) / 100;
  }

  next();
});

export default mongoose.model('Attendance', attendanceSchema);