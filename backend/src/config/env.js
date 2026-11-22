const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const VOICE_MODEL = process.env.VOICE_MODEL || 'claude-haiku-5-5';
const STT_PROVIDER = process.env.STT_PROVIDER || '';
const STT_API_KEY = process.env.STT_API_KEY || '';

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

module.exports = {
  PORT,
  DB_URL,
  JWT_SECRET,
  CLIENT_URL,
  ANTHROPIC_API_KEY,
  VOICE_MODEL,
  STT_PROVIDER,
  STT_API_KEY
};
