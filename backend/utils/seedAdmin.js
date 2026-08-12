// ── utils/seedAdmin.js ────────────────────────────────────────────────────────
// Run once: node utils/seedAdmin.js
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
import User     from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

dotenv.config();

const DEFAULT_EMP_PASSWORD = process.env.EMPLOYEE_PASSWORD || 'Emp@123';

const legacyDepartmentAliases = {
  HR: 'Human Resources',
};

const normalizeDepartmentName = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return legacyDepartmentAliases[trimmed] || trimmed;
};

const splitEmployeeName = (doc) => {
  if (doc.firstName && doc.lastName) {
    return { firstName: doc.firstName, lastName: doc.lastName };
  }

  const fullName = (doc.name || '').trim();
  if (!fullName) {
    return { firstName: 'Employee', lastName: 'User' };
  }

  const parts = fullName.split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || 'User',
  };
};

const normalizeEmployeeId = (doc, fallbackNumber) => {
  const raw = doc.employeeId || doc.employeeCode || '';
  const match = String(raw).match(/EMP-?(\d+)/i);
  if (match) {
    return `EMP-${match[1].padStart(4, '0')}`;
  }
  return `EMP-${String(fallbackNumber).padStart(4, '0')}`;
};

const ensureDepartmentMap = async (legacyEmployees) => {
  const names = [...new Set(
    legacyEmployees
      .map((doc) => normalizeDepartmentName(doc.department))
      .filter((value) => typeof value === 'string' && value)
  )];

  const existing = await Department.find({ name: { $in: names } });
  const map = new Map(existing.map((dept) => [dept.name, dept]));

  for (const name of names) {
    if (map.has(name)) continue;
    const dept = await Department.create({ name, description: `${name} department` });
    map.set(name, dept);
    console.log(`✅ Department created for legacy data: ${name}`);
  }

  return map;
};

const ensureEmployeeUser = async (doc, fullName) => {
  const candidates = [doc.userId, doc.user].filter(Boolean);

  for (const candidate of candidates) {
    if (!mongoose.Types.ObjectId.isValid(candidate)) continue;
    const existingUser = await User.findById(candidate);
    if (existingUser) return existingUser;
  }

  const byEmail = doc.email ? await User.findOne({ email: doc.email.toLowerCase() }) : null;
  if (byEmail) return byEmail;

  const created = await User.create({
    name: fullName,
    email: doc.email.toLowerCase(),
    password: DEFAULT_EMP_PASSWORD,
    role: 'employee',
  });

  console.log(`✅ User created for legacy employee: ${doc.email}`);
  return created;
};

const migrateLegacyEmployees = async () => {
  const collection = mongoose.connection.collection('employees');
  const indexes = await collection.indexes();

  if (indexes.some((index) => index.name === 'employeeCode_1')) {
    await collection.dropIndex('employeeCode_1');
    console.log('✅ Dropped stale employeeCode_1 index');
  }

  const legacyEmployees = await collection.find({
    $or: [
      { userId: { $exists: false } },
      { firstName: { $exists: false } },
      { lastName: { $exists: false } },
      { department: { $type: 'string' } },
      { employeeId: { $exists: false } },
      { employeeId: null },
      { 'leaveBalance.earned': { $exists: false } },
    ],
  }).toArray();

  if (!legacyEmployees.length) {
    await Employee.syncIndexes();
    return;
  }

  const departmentMap = await ensureDepartmentMap(legacyEmployees);
  let fallbackNumber = await collection.countDocuments();

  for (const doc of legacyEmployees) {
    fallbackNumber += 1;

    const { firstName, lastName } = splitEmployeeName(doc);
    const fullName = `${firstName} ${lastName}`.trim();
    const user = await ensureEmployeeUser(doc, fullName);
    const departmentValue = typeof doc.department === 'string'
      ? departmentMap.get(normalizeDepartmentName(doc.department))?._id
      : doc.department;
    const profileImage = typeof doc.profileImage === 'string'
      ? doc.profileImage
      : doc.profileImage?.url || '';

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          userId: user._id,
          firstName,
          lastName,
          email: doc.email.toLowerCase(),
          phone: doc.phone || '0000000000',
          address: typeof doc.address === 'object' && doc.address !== null ? doc.address : {},
          department: departmentValue,
          designation: doc.designation || 'Employee',
          salary: Number(doc.salary) || 0,
          joiningDate: doc.joiningDate ? new Date(doc.joiningDate) : new Date(),
          profileImage,
          status: doc.status || (doc.isActive === false ? 'inactive' : 'active'),
          leaveBalance: {
            sick: doc.leaveBalance?.sick ?? 12,
            casual: doc.leaveBalance?.casual ?? 12,
            earned: doc.leaveBalance?.earned ?? doc.leaveBalance?.annual ?? 15,
          },
          employeeId: normalizeEmployeeId(doc, fallbackNumber),
        },
        $unset: {
          user: '',
          name: '',
          employeeCode: '',
          skills: '',
          experience: '',
          points: '',
          performanceScore: '',
          badges: '',
          isActive: '',
        },
      }
    );
  }

  await Employee.syncIndexes();
  console.log(`✅ Migrated ${legacyEmployees.length} legacy employee record(s)`);
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    await migrateLegacyEmployees();

    // ── Create departments ──────────────────────────────────────────────────
    const deptNames = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations'];
    const depts = [];
    for (const name of deptNames) {
      const existing = await Department.findOne({ name });
      if (existing) { depts.push(existing); continue; }
      const dept = await Department.create({ name, description: `${name} department` });
      depts.push(dept);
      console.log(`✅ Department created: ${name}`);
    }

    // ── Create Admin user ───────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ems.com';
    const adminPwd   = process.env.ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name:     'Super Admin',
        email:    adminEmail,
        password: adminPwd,
        role:     'admin',
      });
      console.log(`✅ Admin user created: ${adminEmail} / ${adminPwd}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    }

    // ── Create sample employees ─────────────────────────────────────────────
    const sampleEmployees = [
      { firstName: 'Arjun',   lastName: 'Sharma',   email: 'arjun@ems.com',   phone: '9876543210', designation: 'Senior Engineer',    dept: 0, salary: 85000 },
      { firstName: 'Priya',   lastName: 'Verma',    email: 'priya@ems.com',   phone: '9876543211', designation: 'HR Manager',          dept: 1, salary: 70000 },
      { firstName: 'Rahul',   lastName: 'Gupta',    email: 'rahul@ems.com',   phone: '9876543212', designation: 'Finance Analyst',     dept: 2, salary: 65000 },
      { firstName: 'Sneha',   lastName: 'Patel',    email: 'sneha@ems.com',   phone: '9876543213', designation: 'Marketing Lead',      dept: 3, salary: 72000 },
      { firstName: 'Vikram',  lastName: 'Singh',    email: 'vikram@ems.com',  phone: '9876543214', designation: 'DevOps Engineer',     dept: 0, salary: 90000 },
      { firstName: 'Ananya',  lastName: 'Roy',      email: 'ananya@ems.com',  phone: '9876543215', designation: 'UI/UX Designer',      dept: 3, salary: 68000 },
      { firstName: 'Karan',   lastName: 'Mehta',    email: 'karan@ems.com',   phone: '9876543216', designation: 'Backend Developer',   dept: 0, salary: 78000 },
      { firstName: 'Divya',   lastName: 'Nair',     email: 'divya@ems.com',   phone: '9876543217', designation: 'Operations Manager',  dept: 4, salary: 74000 },
    ];

    // First employee becomes the demo "emp@ems.com" login
    const demoEmpEmail = 'emp@ems.com';
    const demoEmpPwd   = 'Emp@123';

    for (let i = 0; i < sampleEmployees.length; i++) {
      const s = sampleEmployees[i];
      const emailToUse = i === 0 ? demoEmpEmail : s.email;

      const existingUser = await User.findOne({ email: emailToUse });
      if (existingUser) {
        console.log(`ℹ️  Employee already exists: ${emailToUse}`);
        continue;
      }

      const user = await User.create({
        name:     `${s.firstName} ${s.lastName}`,
        email:    emailToUse,
        password: i === 0 ? demoEmpPwd : DEFAULT_EMP_PASSWORD,
        role:     'employee',
      });

      await Employee.create({
        userId:      user._id,
        firstName:   s.firstName,
        lastName:    s.lastName,
        email:       emailToUse,
        phone:       s.phone,
        department:  depts[s.dept]._id,
        designation: s.designation,
        salary:      s.salary,
        joiningDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: {
          street:  '123 Main Road',
          city:    'Mumbai',
          state:   'Maharashtra',
          zip:     '400001',
          country: 'India',
        },
      });

      console.log(`✅ Employee created: ${s.firstName} ${s.lastName} (${emailToUse})`);
    }

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('────────────────────────────────────');
    console.log('Admin Login:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPwd}`);
    console.log('\nEmployee Login:');
    console.log(`  Email:    ${demoEmpEmail}`);
    console.log(`  Password: ${demoEmpPwd}`);
    console.log('────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
