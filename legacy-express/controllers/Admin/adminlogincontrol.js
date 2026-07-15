const Order = require("../../model/orderModel");
const Products = require("../../model/productModel");
const userDB = require("../../model/userdetails_model");

const bcrypt = require("bcrypt");

exports.Adminlogin = async (req, res) => {
  try {
   
    const {email, password } = req.body;

    const user = await userDB.findOne({ email:email, isadmin: true });

    console.log(user);
    if (!user) {
      return res.status(401).send("User not found");
    }

    console.log(user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Redirect to the admin dashboard upon successful login
      return res.redirect("/admin/dashboard");
    } else {
      return res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.getAdminDashboard = async (req, res) => {
  // console.log(req.session);
  const admin = await userDB.findOne({isadmin:true});
  const users = await userDB.find({isadmin:true});
  const products = await Products.find({});
  // console.log("user length ====",users.length);
  // console.log("product length =====",products.length);
  const orders = await Order.aggregate([
    {
      $unwind: "$orderItems",
    },
  ]);
  const allOrderes = await Order.aggregate([
    {
      $unwind: "$orderItems",
    },
    {
      $match: {
        "orderItems.orderStatus": "delivered",
      },
    },
  ]);
  const pending = await Order.aggregate([
    {
      $unwind: "$orderItems",
    },
    {
      $match: {
        "orderItems.orderStatus": "pending",
      },
    },
  ]);
  const cancel = await Order.aggregate([
    {
      $unwind: "$orderItems",
    },
    {
      $match: {
        "orderItems.orderStatus": "cancel",
      },
    },
  ]);
  console.log(allOrderes.length, "deeel");
  console.log(pending.length, "pennnd");
  console.log(cancel.length, "cancel");

  const status = [
    {
      delivered: allOrderes.length,
      pending: pending.length,
      cancelled: cancel.length,
    },
  ];
  let totalAmount = 0;
  orders.forEach((item) => {
    totalAmount += item.totalAmount;
    // console.log(item.orderItems);
  });
  // console.log(totalAmount);
  const productDetail = [
    {
      totalAmount,
      users: users.length,
      products: products.length,
      orders: orders.length,
    },
  ];

  //         // Use a for...of loop to allow asynchronous operations inside
  //         for (const orderItem of orders) {
  //             for (const item of orderItem.orderItems) {
  //                 const product = await Products.findOne({ _id: item.product });

  //                 if (product) {
  //                     const orderDetail = {
  //                         productName: product.productName,
  //                         quantity: item.quantity,
  //                         price: product.price,
  //                         images: product.images,
  //                     };
  //                     productDetail.push(orderDetail);
  //                 }
  //             }
  //         }
  // console.log(productDetail);
  res.render("dashboard", { productDetail, allOrderes, status });
};
exports.postGraph=async(req,res)=>{
  try{
      console.log("***********",req.body);
  }catch(err){
      console.error("postGraph====>",err.message);
  }
}