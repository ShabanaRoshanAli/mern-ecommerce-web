const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function dbconnect() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

module.exports = dbconnect;
