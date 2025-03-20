const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إعداد تخزين الصور باستخدام multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/products');
  },
  filename: function(req, file, cb) {
    cb(null, `product_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // حد أقصى 5 ميجابايت
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('يرجى تحميل صورة صالحة'));
    }
    cb(null, true);
  }
});

router.post('/', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      image: req.file ? `/uploads/products/${req.file.filename}` : ''
    };
    
    // تحويل السلاسل إلى مصفوفات إذا لزم الأمر
    if (typeof productData.sizes === 'string') {
      productData.sizes = productData.sizes.split(',').map(size => size.trim());
    }
    
    if (typeof productData.colors === 'string') {
      productData.colors = productData.colors.split(',').map(color => color.trim());
    }

    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, search, active, sort, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // تصفية حسب الفئة
    if (category) {
      query.category = category;
    }
    
    // تصفية حسب الحالة (نشط/غير نشط)
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    // البحث في اسم المنتج
    if (search) {
      query.$text = { $search: search };
    }
    
    // إعداد الترتيب
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOption = { createdAt: -1 }; // الافتراضي: الأحدث أولاً
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }
    
    const productData = { ...req.body };
    
    // تحديث الصورة فقط إذا تم تحميل صورة جديدة
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }
    
    // تحويل السلاسل إلى مصفوفات إذا لزم الأمر
    if (typeof productData.sizes === 'string') {
      productData.sizes = productData.sizes.split(',').map(size => size.trim());
    }
    
    if (typeof productData.colors === 'string') {
      productData.colors = productData.colors.split(',').map(color => color.trim());
    }
    
    product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }
    
    // حذف الصورة من التخزين إذا كانت موجودة
    if (product.image) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'تم حذف المنتج والصورة المرتبطة به بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
