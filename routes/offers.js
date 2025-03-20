const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Offer = require('../models/Offer');

// إعداد تخزين الصور باستخدام multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/offers';
    // التأكد من وجود المجلد
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `offer_${Date.now()}${path.extname(file.originalname)}`);
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

// الحصول على جميع العروض
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب العروض', error: error.message });
  }
});

// الحصول على عرض محدد بواسطة المعرف
router.get('/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء جلب العرض', error: error.message });
  }
});

// إضافة عرض جديد
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, oldPrice, newPrice, sizes, colors, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'يرجى إضافة صورة للعرض' });
    }

    // تحويل السلاسل المفصولة بفواصل إلى مصفوفات
    const sizesArray = sizes.split(',');
    const colorsArray = colors ? colors.split(',') : [];

    const newOffer = new Offer({
      name,
      oldPrice,
      newPrice,
      sizes: sizesArray,
      colors: colorsArray,
      description: description || name,
      image: `/uploads/offers/${req.file.filename}`,
      category: 'offers'
    });

    await newOffer.save();
    res.status(201).json({ message: 'تم إضافة العرض بنجاح', offer: newOffer });
  } catch (error) {
    res.status(400).json({ message: 'فشل في إضافة العرض', error: error.message });
  }
});

// تحديث عرض
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, oldPrice, newPrice, sizes, colors, description } = req.body;
    
    // تحويل السلاسل المفصولة بفواصل إلى مصفوفات
    const sizesArray = sizes.split(',');
    const colorsArray = colors ? colors.split(',') : [];

    const updateData = {
      name,
      oldPrice,
      newPrice,
      sizes: sizesArray,
      colors: colorsArray,
      description: description || name
    };

    // إذا تم تحميل صورة جديدة
    if (req.file) {
      updateData.image = `/uploads/offers/${req.file.filename}`;
      
      // حذف الصورة القديمة إذا وجدت
      const oldOffer = await Offer.findById(req.params.id);
      if (oldOffer && oldOffer.image) {
        const oldImagePath = path.join(__dirname, '..', oldOffer.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedOffer) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    res.status(200).json({ message: 'تم تحديث العرض بنجاح', offer: updatedOffer });
  } catch (error) {
    res.status(400).json({ message: 'فشل في تحديث العرض', error: error.message });
  }
});

// حذف عرض
router.delete('/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    // حذف الصورة المرتبطة بالعرض
    if (offer.image) {
      const imagePath = path.join(__dirname, '..', offer.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'تم حذف العرض بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'فشل في حذف العرض', error: error.message });
  }
});

module.exports = router;
