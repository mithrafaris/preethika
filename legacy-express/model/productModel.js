const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
            validator: function(value) {
                return value >= 0;
            },
            message: props => `${props.value} is not a valid stock value. Stock must be a non-negative number.`
        }
    },
    description: {
        type: String,
        required: true,
    },
    images: {
        type: Array,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
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

const Products = mongoose.model("Products", productSchema);

module.exports = Products;
