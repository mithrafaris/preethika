import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
    lowercase: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    validate: {
      validator: function(value: number) {
        return value >= 0;
      },
      message: (props: { value: number }) => `${props.value} is not a valid stock value. Stock must be a non-negative number.`
    }
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  discount: {
    type: String,
  },
  isList: {
    type: Boolean,
    default: true,
  },
});

const Products = mongoose.models.Products || mongoose.model("Products", productSchema);

export default Products;
