const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check if migration has already been run by checking if users table exists
    try {
      await sequelize.query("SELECT 1 FROM users LIMIT 1");
      console.log('✅ Database already migrated, skipping migration');
      return;
    } catch (error) {
      console.log('📋 Database not migrated yet, running migration...');
    }

    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    if (!fs.existsSync(migrationPath)) {
      console.log('⚠️ Migration file not found, skipping migration');
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Running database migration...');
    await sequelize.query(migrationSQL);
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    // Don't exit with error to allow server to start
    console.log('⚠️ Continuing without migration...');
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

runMigration(); 