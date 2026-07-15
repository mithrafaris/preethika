const userDB = require("../../model/userdetails_model");

exports.blockUser = async (req, res) => {
  try {
    const id = req.query.id;

    const user = await userDB.findById(id);

    if (!user) {
      
      return res.status(404).send("User not found");
    }

    user.isBlock = !user.isBlock;
    await user.save();

    console.log(`User with ID ${id} ${user.isBlock ? 'blocked' : 'unblocked'}`);
    res.redirect('/admin/user_details');
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

