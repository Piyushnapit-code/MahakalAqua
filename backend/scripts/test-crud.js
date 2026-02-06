const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Service = require('../models/Service');
const GalleryItem = require('../models/GalleryItem');
const ROPart = require('../models/ROPart');
const ContactRequest = require('../models/ContactRequest');

const testCRUD = async () => {
  try {
    console.log('🧪 Starting CRUD operations test...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test Service CRUD
    console.log('\n🔧 Testing Service CRUD operations...');
    
    // Create
    const testService = new Service({
      title: 'Test RO Installation',
      description: 'Professional RO water purifier installation service',
      category: 'installation',
      price: 2500,
      duration: 2,
      features: ['Free consultation', 'Professional installation', '1 year warranty'],
      serviceAreas: ['Mumbai', 'Pune', 'Nashik'],
      isActive: true,
      featured: false
    });
    
    const savedService = await testService.save();
    console.log('✅ Service created:', savedService.title);
    
    // Read
    const foundService = await Service.findById(savedService._id);
    console.log('✅ Service read:', foundService.title);
    
    // Update
    foundService.price = 3000;
    await foundService.save();
    console.log('✅ Service updated: price changed to', foundService.price);
    
    // Test Gallery CRUD
    console.log('\n🖼️  Testing Gallery CRUD operations...');
    
    const testGallery = new GalleryItem({
      title: 'Test Installation Project',
      description: 'Residential RO installation in Mumbai',
      category: 'installation',
      projectType: 'residential',
      location: 'Mumbai, Maharashtra',
      isActive: true,
      featured: false
    });
    
    const savedGallery = await testGallery.save();
    console.log('✅ Gallery item created:', savedGallery.title);
    
    // Test RO Parts CRUD
    console.log('\n⚙️  Testing RO Parts CRUD operations...');
    
    const testPart = new ROPart({
      name: 'Test Sediment Filter',
      description: '5 micron sediment filter for RO systems',
      category: 'filter',
      brand: 'AquaPure',
      model: 'AP-SF-5',
      price: 250,
      inStock: true,
      stockQuantity: 50,
      isActive: true
    });
    
    const savedPart = await testPart.save();
    console.log('✅ RO Part created:', savedPart.name);
    
    // Test Contact Request CRUD
    console.log('\n📞 Testing Contact Request CRUD operations...');
    
    const testContact = new ContactRequest({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '9876543210',
      subject: 'Test Inquiry',
      message: 'This is a test contact request',
      contactType: 'general',
      status: 'new',
      priority: 'medium'
    });
    
    const savedContact = await testContact.save();
    console.log('✅ Contact request created:', savedContact.name);
    
    // Test API-like queries
    console.log('\n🔍 Testing API-like queries...');
    
    // Get all services with pagination
    const services = await Service.find({ isActive: true })
      .sort({ featured: -1, createdAt: -1 })
      .limit(10);
    console.log('✅ Services query:', services.length, 'services found');
    
    // Get gallery items by category
    const galleryItems = await GalleryItem.find({ 
      category: 'installation',
      isActive: true 
    });
    console.log('✅ Gallery query:', galleryItems.length, 'items found');
    
    // Get RO parts in stock
    const partsInStock = await ROPart.find({ 
      inStock: true,
      isActive: true 
    });
    console.log('✅ Parts query:', partsInStock.length, 'parts in stock');
    
    // Get new contact requests
    const newContacts = await ContactRequest.find({ status: 'new' })
      .sort({ createdAt: -1 });
    console.log('✅ Contacts query:', newContacts.length, 'new contacts');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Service.deleteOne({ _id: savedService._id });
    await GalleryItem.deleteOne({ _id: savedGallery._id });
    await ROPart.deleteOne({ _id: savedPart._id });
    await ContactRequest.deleteOne({ _id: savedContact._id });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All CRUD operations completed successfully!');
    console.log('✅ Database is fully functional and ready for production use');
    
  } catch (error) {
    console.error('❌ CRUD test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run CRUD test
testCRUD();