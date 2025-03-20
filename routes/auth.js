const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middleware/auth');

// مسار للتحقق من صلاحية التوكن
router.get('/verify', isAuthenticated, (req, res) => {
  res.json({ 
    isAuthenticated: true, 
    user: req.user 
  });
});

module.exports = router; 