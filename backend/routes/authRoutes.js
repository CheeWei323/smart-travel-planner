const express = require('express');

const { protect } = require('../middleware/authMiddleware');

const { registerUser, loginUser, updateProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.put('/profile', protect, updateProfile);

module.exports = router;