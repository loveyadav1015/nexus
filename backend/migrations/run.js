const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: false
});

async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, '001_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Schema created.');

    const seedPath = path.join(__dirname, '002_seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);
    console.log('Seed data inserted.');

    const logsPath = path.join(__dirname, '003_assistant_logs.sql');
    if (fs.existsSync(logsPath)) {
      const logsSql = fs.readFileSync(logsPath, 'utf8');
      await pool.query(logsSql);
      console.log('Assistant logs schema created.');
    }

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
