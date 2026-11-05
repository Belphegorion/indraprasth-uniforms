import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { Admin } from '../models/Admin';
import { env } from '../config/env';

export const createOrUpdateAdmin = async (
  email = env.ADMIN_EMAIL,
  password = env.ADMIN_PASSWORD,
  name = 'Store Owner',
  role: 'owner' | 'staff' = 'owner'
) => {
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    await existing.save();
    console.log(`✅ Admin updated: ${email} (${role})`);
    return existing;
  }

  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    isActive: true,
  });

  console.log(`✅ Admin created: ${email} (${role})`);
  return admin;
};

const run = async () => {
  try {
    await connectDB();
    await createOrUpdateAdmin();
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

if (require.main === module) {
  run();
}
