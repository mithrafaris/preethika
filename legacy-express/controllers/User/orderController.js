const { default: mongoose } = require("mongoose");
const Order = require("../../model/orderModel");
const Products = require("../../model/productModel");
const userDB = require("../../model/userdetails_model");
const Razorpay = require("razorpay");

module.exports.getOrders = async (req, res) => {
  try {
    const user = await userDB.findOne({ email: req.session.userId });
    const pipeline = [
      {
        $match: {
          user: user._id,
        },
      },
      {
        $lookup: {
          from: "user_details", // Replace with your actual collection name for users
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$orderItems",
      },
      {
        $lookup: {
          from: "products", // Replace with the actual collection name for products
          localField: "orderItems.product_id",
          foreignField: "_id",
          as: "orderItems.product",
        },
      },
      {
        $sort: {
          purchaseDate: -1, // Sort by purchaseDate in descending order
        },
      },
      {
        $group: {
          _id: "$orderId", // Group by orderId to eliminate duplicates
          user: { $first: "$user" },
          orderId: { $first: "$orderId" },
          orderItems: { $push: "$orderItems" }, // Keep the original orderItems array
          totalAmount: { $first: "$totalAmount" },
          purchaseDate: { $first: "$purchaseDate" },
          deliveryDate: { $first: "$deliveryDate" },
          paymentMethod: { $first: "$paymentMethod" },
          address: { $first: "$address" },
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          orderId: 1,
          orderItems: 1,
          totalAmount: 1,
          purchaseDate: 1,
          deliveryDate: 1,
          paymentMethod: 1,
          address: 1,
        },
      },
    ];

    const orderLists = await Order.aggregate(pipeline);
    const itemsPerPage = 2;
    const totalItems = orderLists.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = orderLists.slice(startIndex, endIndex);

    res.render("orders", {
      user: user,
      orderItem: orderLists,
      totalPages: totalPages,
      currentPage: currentPage,
    });
  } catch (err) {
    console.error("getOrders", err.message);
  }
};



module.exports.postVerifyPayment = async (req, res) => {
  const paymentResponse = req.body;

  if (
    paymentResponse.razorpay_order_id &&
    paymentResponse.razorpay_payment_id
  ) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false });
  }
};

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_ID_KEY,
//   key_secret: process.env.RAZORPAY_SECRET_KEY,
// });



exports.postCreateOrder = async (req, res) => {
 
  const orderAmount = req.body.total * 100; // Amount in paise (1 INR = 100 paise)
  const options = {
    amount: orderAmount,
    currency: "INR",
    receipt: "order_receipt",
    payment_capture: 1,
  };

  razorpay.orders.create(options, (err, order) => {
    if (err) {
      console.error("Error creating order:", err);
      return res.status(500).json({ error: "Failed to create order" });
    } else {
      res.json(order);
    }
  });
};


exports.productCancel = async (req, res) => {
  
  try {
    const orderId = req.body.orderId;
    const orderItemId = req.body.orderItemId;
    const cancelReason = req.body.cancelReason;
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    //console.log(productId);
    let product;
    if (cancelReason !== "damaged") {
      product = await Products.findOneAndUpdate(
        { _id: productId },
        { $inc: { stock: req.body.quantity } }
      );
    }
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: req.body.orderId },
      { $set: { "orderItems.0.orderStatus": "cancel" } }
    );
    let amount = quantity * product.price;
    const user = await userDB.findOneAndUpdate(
      { email: req.session.userId },
      { $inc: { wallet: amount } }
    );

    console.log("****************");
    console.log(updatedOrder);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("productCancel error ----> ", err.message);
  }
};

exports.getProductCancel=async(req,res)=>{
  try{
    console.log(req.query);
    const orderId=req.query.orderId
    const orderItemId=req.query.id

    const pipeline = [
      {$match:{
            orderId
          }},
      {
      
        $lookup: {
          from: 'user_details', // Replace with your actual collection name for users
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $unwind: '$orderItems'
      },
      {
            $match: {
              'orderItems._id': new mongoose.Types.ObjectId(req.query.id) // Replace 'your_order_item_id_here' with the actual order item ID you want to match
            }
          },
      {
        $lookup: {
          from: 'products', // Replace with the actual collection name for products
          localField: 'orderItems.product_id',
          foreignField: '_id',
          as: 'orderItems.product'
        }
      },
      {
        $group: {
          _id: '$orderId', // Group by orderId to eliminate duplicates
          user: { $first: '$user' },
          orderId: { $first: '$orderId' },
          orderItems: { $push: '$orderItems' }, // Keep the original orderItems array
          totalAmount: { $first: '$totalAmount' },
          purchaseDate: { $first: '$purchaseDate' },
          deliveryDate: { $first: '$deliveryDate' },
          paymentMethod: { $first: '$paymentMethod' },
          address:{$first: '$address' }
        }
      },
      {
        $project: {
          _id: 0,
          user: 1,
          orderId: 1,
          orderItems: 1,
          totalAmount: 1,
          purchaseDate: 1,
          deliveryDate: 1,
          paymentMethod: 1,
          address:1,
        }
      }
    ];
    const user = await userDB.findOne({email:req.session.userId})
  const orderLists = await Order.aggregate(pipeline);
  console.log(orderLists);
    res.render('orderCancel',{orderLists,user})
  }catch(err){
    console.error("getProductCancel ---->",err.message);
  }
}


exports.getReturn = async (req, res) => {
  console.log("Return request received");
  try {
      const orderId = req.query.orderId;
      const order = await Order.findOne({ orderId });
      console.log(order);
      console.log(req.query);

      if (!order) {
          return res.status(404).send("Order not found");
      }

      const pipeline = [
          { $match: { orderId } },
          {
              $lookup: {
                  from: 'user_details', // Replace with your actual collection name for users
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user'
              }
          },
          { $unwind: '$user' },
          { $unwind: '$orderItems' },
          {
              $lookup: {
                  from: 'products', // Replace with the actual collection name for products
                  localField: 'orderItems.product_id',
                  foreignField: '_id',
                  as: 'orderItems.product'
              }
          },
          {
              $group: {
                  _id: '$orderId', // Group by orderId to eliminate duplicates
                  user: { $first: '$user' },
                  orderId: { $first: '$orderId' },
                  orderItems: { $push: '$orderItems' }, // Keep the original orderItems array
                  totalAmount: { $first: '$totalAmount' },
                  purchaseDate: { $first: '$purchaseDate' },
                  deliveryDate: { $first: '$deliveryDate' },
                  paymentMethod: { $first: '$paymentMethod' },
                  address: { $first: '$address' }
              }
          },
          {
              $project: {
                  _id: 0,
                  user: 1,
                  orderId: 1,
                  orderItems: 1,
                  totalAmount: 1,
                  purchaseDate: 1,
                  deliveryDate: 1,
                  paymentMethod: 1,
                  address: 1,
              }
          }
      ];

      const orderLists = await Order.aggregate(pipeline);
      console.log("******", orderLists[0].orderItems);
      const orderItems = orderLists[0].orderItems;
      const user = await userDB.findOne({ email: req.session.userId });

      res.render('return', { orderItems, user });
  } catch (err) {
      console.error("getReturn error ----->", err.message);
      res.status(500).send("Internal Server Error");
  }
}
