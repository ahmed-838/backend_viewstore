const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'يرجى إدخال اسم العرض'],
    trim: true
  },
  oldPrice: {
    type: Number,
    required: [true, 'يرجى إدخال السعر القديم'],
    min: [0, 'يجب أن يكون السعر القديم أكبر من أو يساوي صفر']
  },
  newPrice: {
    type: Number,
    required: [true, 'يرجى إدخال السعر الجديد'],
    min: [0, 'يجب أن يكون السعر الجديد أكبر من أو يساوي صفر']
  },
  category: {
    type: String,
    default: 'offers'
  },
  sizes: {
    type: [String],
    required: [true, 'يرجى تحديد المقاسات المتاحة']
  },
  colors: {
    type: [String],
    required: [true, 'يرجى تحديد الألوان المتاحة']
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'يرجى إضافة صورة للعرض']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Offer', OfferSchema);
