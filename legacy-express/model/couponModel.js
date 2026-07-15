const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  userId: [{
    type: String,
  }],
  couponName: {
    type: String,
    required: true,
    unique: true
  },
  couponValue: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  maxValue: {
    type: Number,
    required: true
  },
  minValue: {
    type: Number,
    required: true
  },
  isList: {
    type: Boolean,
    default: true
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon; // Export the Coupon model
