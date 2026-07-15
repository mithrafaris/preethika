const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  name:{
    type:String
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  } ,
  otp:{
    type:String
},

  password: {
    type: String,
  },
  isBlock: {
    type: Boolean,
    default: false,
   
  },
  isadmin: {
    type: Boolean,
    default: false,
  },
  profileImage:{
    type:String
},
cart:{
    type:Array
} ,
wallet:{
    type:Number,
    default:100,
},
address: {
    items: [{
        name: {
            type: String,
            required:true
        },
        phone: {
            type:Number,
            required: true,
        },
        houseNumber: {
            type: String,
            require: true
        },
        pincode:{
            type:Number,
            required: true,
        },
        address:{
            type: String,
            required:true
        },
        city: {
            type: String,
            required:true
        },
        state: {
            type: String,
            required:true
        },
        landmark: {
            type: String
        },
        alternatePhone: {
            type:Number
        }
    }]
}

});

const userDB = mongoose.model("user_details", Schema);
module.exports = userDB;
