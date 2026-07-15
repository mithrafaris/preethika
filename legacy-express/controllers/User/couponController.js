const Coupon = require('../../model/couponModel')
const userDB = require("../../model/userdetails_model");

module.exports.postCouponUpdate=async(req,res)=>{
    try{
        console.log(req.body);
        const couponId = req.body.couponId
        const user = await userDB.findOne({email:req.session.userId})
       console.log(user._id);
          return res.status(200).json({ success: true,couponId });
    }catch(err){
        console.error("postCouponUpdate ===>",err.message);
    }
}