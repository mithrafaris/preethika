const express = require("express");
const user_route = express.Router();
const viewcontroll = require("../controllers/viewcontroller");
const userauth = require("../middleware/usermiddleware");
const userlogincontrol = require("../controllers/User/userlogincontol");
const usersigncontrol = require("../controllers/User/usersigncontrol");
const userhomecontrol = require("../controllers/User/homecontrol");
const errorHandle = require("../middleware/errorHandle");
const productDetailController = require("../controllers/User/productDetailController");
const productController = require("../controllers/User/productcontroller");
const filterCatController = require("../controllers/User/filterCatController");
const couponController = require("../controllers/User/couponController");
const addressController = require("../controllers/User/addressController");
const orderController = require("../controllers/User/orderController");
const walletController = require("../controllers/User/walletController");

user_route.get("/", userhomecontrol.getHome);
user_route.get("/user_login", userauth.isLogin, viewcontroll.user_login);
user_route.post("/user_login", userauth.isLogin, userlogincontrol.loginUser);
//otp
user_route.get("/otplogin", userauth.isLogin, usersigncontrol.getOtp);
user_route.post("/otplogin", usersigncontrol.postOtp);
user_route.get("/otpVerify", userauth.isLogin, usersigncontrol.getOtpVerify);
user_route.post("/otpVerify", usersigncontrol.postOtpVerify);
//profile
user_route.get("/profile", userhomecontrol.getProfile);
//forgot password
user_route.get("/forgot", userlogincontrol.getForgot);
user_route.post("/forgot", userlogincontrol.postForgot);
user_route.get("/resetPassword", userlogincontrol.postForgot);

user_route.post("/resetPassword", userlogincontrol.postResetPassword);

// usersignup
user_route.get("/user_signup", userauth.isLogin, viewcontroll.user_signup);
user_route.post("/register", userauth.isLogin, usersigncontrol.post_signup);
user_route.get("/product", productController.getProducts);

//productdetail
user_route.get("/product-detail",errorHandle.errorHandler,productDetailController.getProductDetail
);
user_route.post("/product-detail", productDetailController.postCartItem);

user_route.post("/add-to-cart", productDetailController.postAddTocart);
user_route.get("/filter-cat", filterCatController.getFilterCat);

user_route.post("/filter-cat", filterCatController.postFiltercat);
user_route.get("/cart", userhomecontrol.getCart);
user_route.get("/cartDelete", userhomecontrol.getCartDelete);
user_route.post("/updateQuantity", userhomecontrol.updateCart);
user_route.post("/", productController.postProductSearch);

//address
user_route.get("/address", addressController.getAddress);
user_route.post("/address", addressController.postAddress);
user_route.get("/editaddress", addressController.getEditAddress);
user_route.post("/editaddress", addressController.postEditAddress);
user_route.get("/deleteaddress", addressController.deleteAddress);

user_route.get("/checkout", productDetailController.getCheckout);
user_route.post("/checkout", productDetailController.postCheckout);

user_route.post("/couponUpdate", couponController.postCouponUpdate);
//order

user_route.get("/orders", orderController.getOrders);

user_route.post("/verifyPayment", orderController.postVerifyPayment);
user_route.post("/createOrder", orderController.postCreateOrder);
user_route.get("/cancel", orderController.getProductCancel);
user_route.post("/product-cancel", orderController.productCancel);
user_route.get("/return", orderController.getReturn);

//wallet
user_route.get("/wallet", walletController.getWallet);
user_route.post("/wallet-order", walletController.postWallet);

//conform order
user_route.get("/confirm-order", productDetailController.getConfirmOrder);

user_route.get("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/");
});

module.exports = user_route;
