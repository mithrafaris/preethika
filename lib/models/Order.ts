import mongoose, { Schema } from 'mongoose';

const orderSchema = new Schema({
  orderId : {
    type : String,
    required : true
  },
  user:{
    type: Schema.Types.ObjectId,
    ref: 'user_details'
  },
  orderItems : {
    type : [
      {
        product_id: { type: Schema.Types.ObjectId, ref: 'Products' },
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
    type: String
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
    default : () => new Date()
  },
  deliveryDate : {
    type : Date,
    default : null
  },
  paymentMethod :{
    type : String,
  },
  address:{
    type: String,
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
