const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'يرجى إدخال اسم المنتج'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'يرجى إدخال سعر المنتج'],
    min: [0, 'يجب أن يكون السعر أكبر من صفر']
  },
  category: {
    type: String,
    required: [true, 'يرجى اختيار فئة المنتج'],
    enum: {
      values: ['pants', 'shirts', 'hoodies', 'boxers', 'undershirt', 'underwear'],
      message: 'الفئة غير صالحة'
    }
  },
  sizes: {
    type: [String],
    required: [true, 'يرجى اختيار مقاس واحد على الأقل'],
    validate: {
      validator: function(sizes) {
        return sizes.length > 0;
      },
      message: 'يجب اختيار مقاس واحد على الأقل'
    },
    enum: {
      values: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'],
      message: 'المقاس غير صالح'
    }
  },
  colors: {
    type: [String],
    required: [true, 'يرجى اختيار لون واحد على الأقل'],
    validate: {
      validator: function(colors) {
        return colors.length > 0;
      },
      message: 'يجب اختيار لون واحد على الأقل'
    },
    enum: {
      values: ['black', 'white', 'red', 'blue', 'green', 'yellow', 'gray', 'brown', 'navy', 'beige'],
      message: 'اللون غير صالح'
    }
  },
  image: {
    type: String,
    required: [true, 'يرجى إضافة صورة للمنتج']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// إضافة فهرس للبحث السريع
productSchema.index({ name: 'text', category: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
