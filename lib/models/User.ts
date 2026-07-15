import mongoose, { Schema } from 'mongoose';

const UserAddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  houseNumber: { type: String, required: true },
  pincode: { type: Number, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: { type: Number }
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  otp: { type: String },
  password: { type: String },
  isBlock: { type: Boolean, default: false },
  isadmin: { type: Boolean, default: false },
  profileImage: { type: String },
  cart: {
    type: [
      {
        product_id: { type: Schema.Types.ObjectId, ref: 'Products' },
        quantity: { type: Number, default: 1 }
      }
    ],
    default: []
  },
  wallet: { type: Number, default: 100 },
  address: {
    items: [UserAddressSchema]
  }
});

const User = mongoose.models.user_details || mongoose.model('user_details', UserSchema);

export default User;
