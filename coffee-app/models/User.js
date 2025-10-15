const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  edad: { type: Number },
  role: { type: String, default: 'user' },
}, { timestamps: true });

const collectionName = process.env.USER_COLLECTION || 'sis';
module.exports = mongoose.model('User', userSchema, collectionName);
