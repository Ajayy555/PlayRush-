const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ username: 'playrush_admin' });
    if (existing) { console.log('✅ Admin already exists'); return; }
    await User.create({ username: 'playrush_admin', role: 'ADMIN' });
    console.log('🌱 Admin seeded: username = playrush_admin');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = seedAdmin;
