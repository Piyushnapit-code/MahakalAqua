const mongoose = require('mongoose');

// Create default admin user - REQUIRES ADMIN_* variables in env
const createDefaultAdmin = async () => {
  try {
    const Admin = mongoose.model('Admin');
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      const adminName = process.env.ADMIN_NAME;
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminName || !adminEmail || !adminPassword) {
        console.error('ERROR: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD environment variables are required');
        throw new Error('Admin credentials not configured in environment variables');
      }
      
      const defaultAdmin = new Admin({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin'
      });
      
      await defaultAdmin.save();
      console.log('👤 Default admin user created');
      console.log('⚠️  Please change the default password after first login!');
    }
  } catch (error) {
    console.warn('⚠️  Warning: Could not create default admin user:', error.message);
  }
};

// Database connection function
const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    
    console.log('🔌 Connecting to MongoDB...');
    
    // Connection options optimized for MongoDB Atlas - REQUIRES DB_* variables in env
    const maxPoolSize = parseInt(process.env.DB_MAX_POOL_SIZE, 10);
    const serverSelectionTimeoutMS = parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT_MS, 10);
    const socketTimeoutMS = parseInt(process.env.DB_SOCKET_TIMEOUT_MS, 10);
    const connectTimeoutMS = parseInt(process.env.DB_CONNECT_TIMEOUT_MS, 10);
    
    if (!maxPoolSize || !serverSelectionTimeoutMS || !socketTimeoutMS || !connectTimeoutMS) {
      throw new Error('DB_MAX_POOL_SIZE, DB_SERVER_SELECTION_TIMEOUT_MS, DB_SOCKET_TIMEOUT_MS, and DB_CONNECT_TIMEOUT_MS are required');
    }
    
    const connectionOptions = {
      maxPoolSize: maxPoolSize,
      serverSelectionTimeoutMS: serverSelectionTimeoutMS,
      socketTimeoutMS: socketTimeoutMS,
      connectTimeoutMS: connectTimeoutMS,
      retryWrites: true,
      w: 'majority'
    };
    
    await mongoose.connect(mongoURI, connectionOptions);
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // Import models to register them
    require('../models/Admin');
    require('../models/ContactRequest');
    require('../models/Enquiry');
    require('../models/GalleryItem');
    require('../models/IssueRequest');
    require('../models/ROPart');
    require('../models/Service');
    require('../models/Visit');
    
    // Create default admin user
    await createDefaultAdmin();
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Retrying in 5 seconds...');
      setTimeout(() => connectDatabase(), 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDatabase;