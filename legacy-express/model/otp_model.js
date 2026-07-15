const mongoose = require('mongoose');

exports.otpSchema = new mongoose.Schema({
    number: {
        type: Number, 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { explain: 60 }
    }
}, { timestamps: true });

const otp = mongoose.model('otp', exports.otpSchema); // Fix: Use exports.otpSchema consistently
