import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema({
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

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export default Coupon;
