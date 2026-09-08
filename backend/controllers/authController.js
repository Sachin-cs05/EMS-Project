import crypto from 'crypto';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import validatePassword from '../utils/passwordValidator.js';

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Email and password are required'));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Your account has been deactivated. Contact admin.'));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Fetch employee profile if not admin
    let employeeProfile = null;
    if (user.role === 'employee') {
      employeeProfile = await Employee.findOne({ userId: user._id })
        .populate('department', 'name');
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json(
      new ApiResponse(200, {
        token,
        user: {
          _id:          user._id,
          name:         user.name,
          email:        user.email,
          role:         user.role,
          profileImage: user.profileImage,
          lastLogin:    user.lastLogin,
        },
        employee: employeeProfile,
      }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let employeeProfile = null;

    if (user.role === 'employee') {
      employeeProfile = await Employee.findOne({ userId: user._id })
        .populate('department', 'name description');
    }

    res.status(200).json(
      new ApiResponse(200, { user, employee: employeeProfile }, 'Profile fetched')
    );
  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    // JWT is stateless — client removes token.
    // For extra security, maintain a token blacklist in Redis/DB (optional).
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ApiError(400, 'Both current and new passwords are required'));
    }
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return next(new ApiError(400, passwordError));
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return next(new ApiError(401, 'Current password is incorrect'));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ApiError(400, 'Email is required'));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json(
        new ApiResponse(200, null, 'If that email exists, a reset link has been sent')
      );
    }

    // Generate reset token
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#4F46E5">EMS — Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;
          background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px">This link expires in 15 minutes. If you did not request this, ignore this email.</p>
      </div>
    `;

    await sendEmail({ to: user.email, subject: 'EMS — Password Reset Request', html });

    res.status(200).json(
      new ApiResponse(200, null, 'If that email exists, a reset link has been sent')
    );
  } catch (error) {
    next(error);
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const passwordError = validatePassword(password);

    if (passwordError) {
      return next(new ApiError(400, passwordError));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError(400, 'Reset token is invalid or has expired'));
    }

    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully'));
  } catch (error) {
    next(error);
  }
};
