const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 

const { getUsers, register, login, getUserProfile, changePassword } = require('../controllers/authController');

router.get('/users', getUsers);
router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getUserProfile); 
router.post('/change-password', auth, changePassword);

module.exports = router;