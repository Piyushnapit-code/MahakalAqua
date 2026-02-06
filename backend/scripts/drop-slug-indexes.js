const mongoose = require('mongoose');
require('dotenv').config();

async function dropSlugIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = ['services', 'galleryitems', 'roparts'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        await collection.dropIndex('slug_1');
        console.log(`Dropped slug_1 index from ${collectionName}`);
      } catch (err) {
        console.log(`No slug_1 index in ${collectionName} or error: ${err.message}`);
      }
    }
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropSlugIndexes();