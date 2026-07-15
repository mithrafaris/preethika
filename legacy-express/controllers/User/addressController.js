const userDB = require("../../model/userdetails_model");

const mongoose = require('mongoose')

module.exports.getAddress = async(req,res)=>{
    try{
        const user = await userDB.findOne({email:req.session.userId})
        
       res.render('address',{user:user,addressList:user.address.items})
    }catch(err){
        console.error("getaddress",err.message);
    }
}

module.exports.postAddress=async(req,res)=>{
    try{
        // console.log(req.session.userId);
        if(req.session.userId){
            const addressData= {
                name: req.body.name,
                phone:Number(req.body.phone),
                houseNumber:Number(req.body.houseNumber),
                pincode:Number(req.body.pincode),
                address:req.body.address,
                city:req.body.city,
                state:req.body.state,
                landmark:req.body.landmark,
                alternatePhone:Number(req.body.altPhone)
            }
            const address = await userDB.updateOne({email:req.session.userId},{$push: { "address.items": addressData}});
            res.redirect('/address')
        }
    }catch(err){
        console.error("postAddress",err.message);
    }
}


// Function to render the edit address page
exports.getEditAddress = async (req, res) => {
  try {
      const id = req.query.id;
      const user = await userDB.findOne({ email: req.session.userId });
      if (!user) {
          return res.status(404).send("User not found");
      }

      const foundAddress = user.address.items.find(item => item._id.toString() === id);
      if (!foundAddress) {
          return res.status(404).send("Address not found");
      }

      res.render('editAddress', { user: user, address: foundAddress });
  } catch (err) {
      console.error("getEditAddress --> ", err.message);
      res.status(500).send('Internal Server Error');
  }
};

// Function to handle editing an address
module.exports.postEditAddress = async (req, res) => {
  try {
      const id = req.query.id;
      const user = await userDB.findOne({ email: req.session.userId });
      if (!user) {
          return res.status(404).send("User not found");
      }

      const foundAddressIndex = user.address.items.findIndex(item => item._id.toString() === id);
      if (foundAddressIndex === -1) {
          return res.status(404).send("Address not found");
      }

      // Update address fields based on req.body
      Object.assign(user.address.items[foundAddressIndex], req.body);
      await user.save();

      res.redirect('/address'); // Assuming '/address' is the page where addresses are listed
  } catch (err) {
      console.error("postEditAddress --->", err.message);
      res.status(500).send('Internal Server Error');
  }
};

// Function to delete an address
module.exports.deleteAddress = async (req, res) => {
  try {
      const id = req.query.id;
      const user = await userDB.findOne({ email: req.session.userId });
      if (!user) {
          return res.status(404).send("User not found");
      }

      user.address.items = user.address.items.filter(item => item._id.toString() !== id);
      await user.save();

      res.redirect('/address'); // Redirect to address page after deletion
  } catch (err) {
      console.error("deleteAddress--->", err.message);
      res.status(500).send('Internal Server Error');
  }
};
