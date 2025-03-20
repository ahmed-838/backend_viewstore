const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // الحصول على التوكن من الطلب (تم تعيينه في middleware السابق)
  const token = req.token || req.header('x-auth-token') || (req.header('authorization') ? req.header('authorization').replace('Bearer ', '') : null);

  // التحقق من وجود التوكن
  if (!token) {
    return res.status(401).json({ msg: 'لا يوجد توكن، تم رفض الوصول' });
  }

  try {
    // التحقق من صحة التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'التوكن غير صالح' });
  }
};

// إضافة تصدير لدالة isAuthenticated التي تستخدمها ملفات المسارات
module.exports.isAuthenticated = module.exports;
