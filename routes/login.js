const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// مسار تسجيل الدخول
router.post('/', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    // التحقق من وجود البريد الإلكتروني أو رقم الهاتف
    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'ركز و حاول تاني ' });
    }
    
    // التحقق من كلمة المرور
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'ركز و حاول تاني ' });
    }
    
    // إنشاء رمز JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    });
    
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;
