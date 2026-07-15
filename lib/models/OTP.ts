import mongoose, { Schema } from 'mongoose';

const otpSchema = new Schema({
  number: {
    type: Number, 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 // Expire OTP after 60 seconds
  }
}, { timestamps: true });

const OTP = mongoose.models.otp || mongoose.model('otp', otpSchema);

export default OTP;
