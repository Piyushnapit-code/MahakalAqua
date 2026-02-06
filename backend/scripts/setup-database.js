const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!existingAdmin) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      
      const adminUser = new Admin({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      });
      
      await adminUser.save();
      console.log('👤 Default admin user created');
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD}`);
    } else {
      console.log('👤 Admin user already exists');
    }
    
    // Create necessary indexes
    console.log('📈 Creating database indexes...');
    
    // Admin indexes
    await Admin.collection.createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ Database setup completed successfully!');
    console.log('🎉 Your application is ready to use');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run setup
setupDatabase();