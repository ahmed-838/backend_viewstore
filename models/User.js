const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// طريقة للتحقق من كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// إنشاء مستخدم افتراضي إذا لم يكن هناك مستخدمين
const createDefaultUser = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        email: 'admin@example.com',
        phone: '01234567890',
        password: hashedPassword,
        isAdmin: true
      });
      
      console.log('تم إنشاء المستخدم الافتراضي بنجاح');
    }
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم الافتراضي:', error);
  }
};

module.exports = { User, createDefaultUser };
