require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/register', async (req, res) => {
  try {
    const { nombres, apellidos, email, password, edad } = req.body;
    if (!nombres || !apellidos || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email ya registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ nombres, apellidos, email, password: hashed, edad });
    await user.save();

    return res.status(201).json({ message: 'Usuario creado', user: { id: user._id, email: user.email, nombres: user.nombres } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET || 'change-me', { expiresIn: '7d' });

    return res.json({ message: 'Autenticado', token, user: { id: user._id, nombres: user.nombres, apellidos: user.apellidos, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

app.use('/', express.static(path.join(__dirname, 'public')));

async function start() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coffee_app';
  const dbName = process.env.MONGO_DB_NAME || 'barver';
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName });
    console.log(`Connected to MongoDB (db: ${dbName})`);
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

start();
