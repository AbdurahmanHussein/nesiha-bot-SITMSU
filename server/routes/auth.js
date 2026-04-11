const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'nesiha_super_secret_jwt_key_2026',
    { expiresIn: '24h' }
  );

  res.json({ token, email: user.email });
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nesiha_super_secret_jwt_key_2026');
    const db = getDb();
    const user = db.prepare('SELECT id, email, profile_photo FROM admin_users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ valid: false });
    
    res.json({ valid: true, user: { ...decoded, profile_photo: user.profile_photo } });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

const { requireAuth } = require('../middleware/auth');

router.put('/profile-photo', requireAuth, (req, res) => {
  const { photoBase64 } = req.body;
  const db = getDb();
  
  try {
    db.prepare('UPDATE admin_users SET profile_photo = ? WHERE id = ?').run(photoBase64, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile photo' });
  }
});

router.post('/register-admin', requireAuth, (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and password (min 6 chars) required' });
  }

  const db = getDb();
  
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)')
      .run(email, hash);
      
    res.json({ success: true, message: 'Admin created successfully' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'An admin with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

module.exports = router;
