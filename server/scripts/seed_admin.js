import sequelize from '../src/config/database.js';
import User from '../src/db/models/User.js';

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Ensure the table exists and schema is up to date
    await sequelize.sync({ alter: true });
    console.log('Table schema synchronized.');
    
    const [admin, created] = await User.findOrCreate({
      where: { email: 'manoj@adsyncmedia.com' },
      defaults: {
        name: 'Manoj Admin',
        password: 'Google12@',
        role: 'admin',
        phone: '',
      }
    });

    if (created) {
      console.log('✅ Admin user created successfully! Email: manoj@adsyncmedia.com');
    } else {
      console.log('ℹ️ Admin user already exists with this email.');
    }
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
  } finally {
    process.exit();
  }
};

seedAdmin();
