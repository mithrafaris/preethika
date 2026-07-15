const Category = require("../../model/categoryModel");
const Products = require("../../model/productModel");
const userDB = require("../../model/userdetails_model");

exports.getProducts = async (req, res) => {
  try {
    const products = await Products.find({ isList: true }).populate('category');
    const categories = await Category.find({ isList: true });
    const user = await userDB.findOne({ email: req.session.userId });
    console.log("getProducts -- products", products);
    res.render("product", { products, user, categories });
  } catch (err) {
    console.error("getProducts ===> ", err.message);
  }
};

exports.postProductSearch = async (req, res) => {
  try {
    console.log(req.body);
    const user = await userDB.findOne({ email: req.session.userId });
    const categories = await Category.find({ isList: true });
    const searchQuery = new RegExp("^" + req.body.search, "i"); // Adding "i" flag for case-insensitive search
    console.log(req.body.search);
    const products = await Products.find({ productName: { $regex: searchQuery }, isList: true }).populate('category');
    const allProducts = await Products.find({}); // Fetch all products for fallback
    if (products.length === 0) {
      res.render('product', { products: allProducts, user, categories });
    } else {
      res.render('product', { products, user, categories });
    }
  } catch (err) {
    console.error("postProductSearch ===> ", err.message);
  }
};
