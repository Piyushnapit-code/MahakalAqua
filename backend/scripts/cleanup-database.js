const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all models
const Admin = require('../models/Admin');
const Service = require('../models/Service');
const GalleryItem = require('../models/GalleryItem');
const ROPart = require('../models/ROPart');
const Enquiry = require('../models/Enquiry');
const ContactRequest = require('../models/ContactRequest');
const IssueRequest = require('../models/IssueRequest');
const Visit = require('../models/Visit');

const cleanupDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Remove all data from collections
    console.log('🗑️  Removing all data from collections...');
    
    await Promise.all([
      Service.deleteMany({}),
      GalleryItem.deleteMany({}),
      ROPart.deleteMany({}),
      Enquiry.deleteMany({}),
      ContactRequest.deleteMany({}),
      IssueRequest.deleteMany({}),
      Visit.deleteMany({})
    ]);
    
    console.log('✅ All demo data removed successfully');
    
    // Keep only the admin user or recreate if needed
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('👤 Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      const adminName = process.env.ADMIN_NAME;
      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (!adminName || !adminEmail) {
        throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required');
      }
      
      const adminUser = new Admin({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      });
      
      await adminUser.save();
      console.log('👤 Default admin user created');
      console.log(`📧 Email: ${adminUser.email}`);
    } else {
      console.log('👤 Admin user(s) preserved');
    }
    
    // Reset auto-increment counters if any
    console.log('🔄 Resetting database state...');
    
    // Create fresh indexes
    console.log('📈 Recreating database indexes...');
    
    await Promise.all([
      Admin.collection.createIndex({ email: 1 }, { unique: true }),
      Service.collection.createIndex({ category: 1 }),
      Service.collection.createIndex({ isActive: 1 }),
      GalleryItem.collection.createIndex({ category: 1 }),
      GalleryItem.collection.createIndex({ isActive: 1 }),
      ROPart.collection.createIndex({ category: 1 }),
      ROPart.collection.createIndex({ isActive: 1 }),
      Enquiry.collection.createIndex({ status: 1 }),
      Enquiry.collection.createIndex({ createdAt: -1 }),
      ContactRequest.collection.createIndex({ status: 1 }),
      ContactRequest.collection.createIndex({ createdAt: -1 }),
      IssueRequest.collection.createIndex({ ticketNumber: 1 }, { unique: true }),
      IssueRequest.collection.createIndex({ status: 1 }),
      Visit.collection.createIndex({ sessionId: 1 }),
      Visit.collection.createIndex({ ipAddress: 1 }),
      Visit.collection.createIndex({ path: 1 }),
      Visit.collection.createIndex({ createdAt: -1 })
    ]);
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('🎉 Database is now clean and ready for fresh data');
    
    // Display collection counts
    const counts = await Promise.all([
      Admin.countDocuments(),
      Service.countDocuments(),
      GalleryItem.countDocuments(),
      ROPart.countDocuments(),
      Enquiry.countDocuments(),
      ContactRequest.countDocuments(),
      IssueRequest.countDocuments(),
      Visit.countDocuments()
    ]);
    
    console.log('\n📊 Current collection counts:');
    console.log(`👤 Admins: ${counts[0]}`);
    console.log(`🔧 Services: ${counts[1]}`);
    console.log(`🖼️  Gallery Items: ${counts[2]}`);
    console.log(`⚙️  RO Parts: ${counts[3]}`);
    console.log(`📝 Enquiries: ${counts[4]}`);
    console.log(`📞 Contact Requests: ${counts[5]}`);
    console.log(`🎫 Issue Requests: ${counts[6]}`);
    console.log(`👁️  Visits: ${counts[7]}`);
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run cleanup
cleanupDatabase();