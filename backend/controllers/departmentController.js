// ════════════════════════════════════════════════════════════════════════════
//  DEPARTMENT CONTROLLER
// ════════════════════════════════════════════════════════════════════════════
import Department from '../models/Department.js';
import Employee   from '../models/Employee.js';
import ApiError   from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('head', 'firstName lastName')
      .populate('employeeCount');

    res.status(200).json(
      new ApiResponse(200, { departments }, 'Departments fetched')
    );
  } catch (e) { next(e); }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, head } = req.body;
    if (!name) return next(new ApiError(400, 'Department name is required'));

    const dept = await Department.create({ name, description, head: head || null });
    res.status(201).json(new ApiResponse(201, { department: dept }, 'Department created'));
  } catch (e) { next(e); }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!dept) return next(new ApiError(404, 'Department not found'));
    res.status(200).json(new ApiResponse(200, { department: dept }, 'Department updated'));
  } catch (e) { next(e); }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const count = await Employee.countDocuments({ department: req.params.id, status: 'active' });
    if (count > 0) {
      return next(new ApiError(400, `Cannot delete — ${count} active employee(s) are in this department`));
    }
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Department deleted'));
  } catch (e) { next(e); }
};
