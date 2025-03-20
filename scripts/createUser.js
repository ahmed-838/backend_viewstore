const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
require('dotenv').config();

// اتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to database successfully'))
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

// دالة لإنشاء مستخدم جديد
const createNewUser = async (userData) => {
  try {
    // التحقق من وجود البريد الإلكتروني أو رقم الهاتف مسبقًا
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { phone: userData.phone }
      ]
    });

    if (existingUser) {
      console.log('The user already exists! The email or phone number is already used.');
      process.exit(1);
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // إنشاء المستخدم الجديد
    const newUser = await User.create({
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      isAdmin: userData.isAdmin || false
    });

    console.log('The user has been created successfully:');
    console.log(`Email: ${newUser.email}`);
    console.log(`Phone: ${newUser.phone}`);
    console.log(`Admin: ${newUser.isAdmin ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    mongoose.connection.close();
  }
};

const newUserData = {
  email: 'ahmed@viewstore.shop',
  phone: '01126711312',
  password: 'ahmed@011',
  isAdmin: true 
};

createNewUser(newUserData); 