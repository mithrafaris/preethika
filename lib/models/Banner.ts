import mongoose, { Schema } from 'mongoose';

const bannerSchema = new Schema({
  bannerName:{
    type: String,
    required: true,
    lowercase: true
  },
  image:{
    type: String,
  },
  title:{
    type: String,
    required: true,
  },
  subtitle:{
    type: String,
    required: true,
  },
  isList:{
    type: Boolean,
    default: true,
  }
});

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export default Banner;
