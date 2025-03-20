const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/Database");
const productRoutes = require('./routes/product');
const offerRoutes = require('./routes/offers');
const loginRoutes = require('./routes/login');
const authRoutes = require('./routes/auth');

dotenv.config();
connectDB();

const app = express(); 

// تكوين CORS بشكل أكثر تحديدًا للسماح بالطلبات من جميع المصادر
app.use(cors({
  origin: '*', // السماح لجميع المصادر
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// إضافة مسار ثابت للملفات المرفوعة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// إنشاء مجلد uploads إذا لم يكن موجودًا
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads/products');
const offersDir = path.join(__dirname, 'uploads/offers');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(offersDir)) {
    fs.mkdirSync(offersDir, { recursive: true });
}

// إضافة middleware للتحقق من التوكن من كلا الحقلين
app.use((req, res, next) => {
    // استخراج التوكن من x-auth-token أو Authorization
    const tokenFromHeader = req.header('x-auth-token');
    const authHeader = req.header('authorization');
    
    // استخراج التوكن من حقل Authorization إذا كان موجودًا
    let tokenFromAuth = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        tokenFromAuth = authHeader.substring(7);
    }
    
    // استخدام التوكن من أي من الحقلين
    req.token = tokenFromHeader || tokenFromAuth;
    next();
});

app.get("/", (req, res) => { 
    res.send("Hello World");
});

app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 4444;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Server is accessible at http://localhost:${port}`);
    console.log(`For other devices on the network, use http://192.168.70.68:${port}`);
});
