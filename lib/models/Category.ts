import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
    lowercase: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  isList: {
    type: Boolean,
    default: true
  },
  products: [{ type: Schema.Types.ObjectId, ref: 'Products' }]
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;
