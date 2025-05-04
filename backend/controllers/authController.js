const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

exports.register = async (req, res) => {
  const { name, phone_number, password, address, role } = req.body;
  try {
    const user = await userModel.findUserByPhone(phone_number);
    if (user) return res.status(400).json({ error: 'Phone number already exists' });
    await userModel.createUser(name, phone_number, password, address, role);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { phone_number, password } = req.body;
  try {
    const user = await userModel.findUserByPhone(phone_number);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 