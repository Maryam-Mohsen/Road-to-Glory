require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMINS = [
  { username: 'janjoon', name: 'Admin - Janjoon', email: 'janjoon@roadtoglory.local' },
  { username: 'd3d3', name: 'Admin - D3D3', email: 'd3d3@roadtoglory.local' },
  { username: 'mariomaaa', name: 'Admin - Mariomaaa', email: 'mariomaaa@roadtoglory.local' },
];

const PASSWORD = '123456';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const admin of ADMINS) {
    const existing = await User.findOne({ username: admin.username });
    if (existing) {
      console.log(`Skipped (already exists): ${admin.username}`);
      continue;
    }

    await User.create({
      ...admin,
      password: PASSWORD,
      role: 'admin',
      organizerStatus: 'not_applicable',
    });
    console.log(`Created admin: ${admin.username}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
