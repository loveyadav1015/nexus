const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: false
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected: ' + result.rows[0].now);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();

module.exports = pool;
