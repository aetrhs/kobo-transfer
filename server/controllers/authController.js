const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all users for checking
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = String(password).replace(/\s/g, ''); 

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email has already been used for registration" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);
    
    console.log('register email:', cleanEmail);
    console.log('register password entered:', cleanPassword);
    console.log('hashed pw: ', hashedPassword);

    const user = new User({
      email: cleanEmail,
      password: hashedPassword
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      pin: user.loginPin
    });
    console.log('user registered');
  } catch (err) {
    console.error('error during registration:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, pin } = req.body;
    let user = null;

    if (pin && pin.toString().trim() !== "") {
      const cleanPin = pin.toString().trim().toUpperCase();
      user = await User.findOne({ loginPin: cleanPin });
      console.log('user found w pin:', user);
    } else if (email && password) {
      const cleanEmail = email.toLowerCase().trim();
      const cleanPassword = String(password).replace(/\s/g, ''); 

      user = await User.findOne({ email: cleanEmail }).select('+password');
      
      if (user) {
        console.log('user found w email:', user);
        const correctPw = await bcrypt.compare(cleanPassword, user.password);
        console.log('pw matched');

        if (!correctPw) {
          console.log('password mismatch');
          user = null;
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please try again.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        email: user.email,
        pin: user.loginPin
      }
    });
  } catch (err) {
    console.error('error during login:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};