const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔄 ========== MIGRATION STARTING ==========');
  console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
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
      console.log('📋 Migration check error:', error.message);
    }

    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    console.log('📍 Migration file path:', migrationPath);
    
    if (!fs.existsSync(migrationPath)) {
      console.log('⚠️ Migration file not found, skipping migration');
      console.log('📂 Current directory contents:', fs.readdirSync(__dirname));
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📋 Migration SQL length:', migrationSQL.length);
    
    console.log('📋 Running database migration...');
    await sequelize.query(migrationSQL);
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.name);
    console.error('❌ Migration error message:', error.message);
    if (error.original) {
      console.error('❌ Original migration error:', error.original);
    }
    // Don't exit with error to allow server to start
    console.log('⚠️ Continuing without migration...');
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
    console.log('✅ ========== MIGRATION FINISHED ==========');
  }
}

runMigration(); 