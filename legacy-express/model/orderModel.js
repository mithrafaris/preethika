const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId : {
        type : String,
        required : true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user_details'
        
    },
    orderItems : {
        type : [
            {
                product_id: mongoose.Schema.Types.ObjectId,
                quantity: Number,
                orderStatus : {
                    type : String,
                    default : "pending"
                }
            }
        ],
        required : true
    },
    orderCancleRequest: {
        type: Boolean,
        default: false
    },
    orderCancelReason:{
        type:String
    },
    orderReturnRequest: {
        type: Boolean,
        default: false
    },
    orderReturnReason:{
        type: String
    },
    totalAmount : {
        type : Number,
    },
    purchaseDate : {
        type : Date,
        default : new Date()
    },
    deliveryDate : {
        type : Date,
        default : null
    },
    paymentMethod :{
        type : String,
    },
    address:{
        type:String,
    }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
