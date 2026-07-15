const userDB= require("../../model/userdetails_model")

module.exports.getWallet=async(req,res)=>{
    try{
        const user = await userDB.find({})
    }catch(err){
        console.error("getWallet ====> ",err.message);
    }
}