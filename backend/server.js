require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please create a .env file based on .env.example');
  process.exit(1);
}

// Warn if using default JWT secret in production
if (process.env.NODE_ENV === 'production' && 
    (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production' ||
     !process.env.JWT_SECRET)) {
  console.error('❌ Error: JWT_SECRET must be changed from default value in production!');
  process.exit(1);
}

const app = require('./app');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT;

// Create necessary directories
const createDirectories = () => {
  const directoriesEnv = process.env.DIRECTORIES;
  if (!directoriesEnv) {
    throw new Error('DIRECTORIES environment variable is required. Example: uploads,uploads/gallery,uploads/images,logs');
  }
  const directories = directoriesEnv.split(',').map(dir => path.join(__dirname, dir.trim()));
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Create directories on startup
createDirectories();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
🌐 API Base URL: http://localhost:${PORT}/api
📊 Health Check: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, _promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

module.exports = server;