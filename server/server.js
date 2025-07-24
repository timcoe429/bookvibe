const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('Database synchronized.');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
