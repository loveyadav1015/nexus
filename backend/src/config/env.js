const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

module.exports = {
  PORT,
  DB_URL,
  JWT_SECRET,
  CLIENT_URL
};
