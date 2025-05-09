const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

exports.register = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { name, phone_number, password, address, role } = req.body;
    
    // Validate required fields
    if (!name || !phone_number || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'phone_number', 'password']
      });
    }

    // Validate phone number format (basic validation)
    if (!/^[0-9]{10,11}$/.test(phone_number)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if user exists
    const existingUser = await userModel.findUserByPhone(phone_number);
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    // Create new user
    await userModel.createUser(name, phone_number, password, address, role);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Cho phép nhận cả phone_number hoặc phone
    const phone_number = req.body.phone_number || req.body.phone || '';
    const password = req.body.password;

    // Validate required fields
    if (!phone_number || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['phone_number', 'password']
      });
    }

    // Find user
    const user = await userModel.findUserByPhone(phone_number);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 