const { ObjectId } = require('mongodb');
const userDB = require("../../model/userdetails_model");
const Category = require("../../model/categoryModel");
const Products = require("../../model/productModel");
const Banner = require("../../model/banner");

exports.getFilterCat = async (req, res) => {
    try {
        if (req.query.id !== "") {
            const id = new ObjectId(req.query.id);
            console.log(id);
    
            const user = await userDB.findOne({ email: req.session.userId });
            const categories = await Category.find({ isList: true });

            const productsWithCategory = await Products.find({ category: id, isList: true }).populate('category');

            const banner = await Banner.find({ isList: true });

            res.render('home', { user: user, products: productsWithCategory, category: categories, banner });
        } else {
            // Render the home page without filtering by category
            const user = await userDB.findOne({ email: req.session.userId });
            const categories = await Category.find({ isList: true });
            const banner = await Banner.find({ isList: true });
            const allProducts = await Products.find({ isList: true }).populate('category');
            res.render('home', { user: user, products: allProducts, category: categories, banner });
        }
    } catch (err) {
        console.error("getFilterCat ---->", err.message);
    }
};

exports.postFiltercat = async (req, res) => {
    try {
        console.log(req.body);
        const catname = req.body.catname;
        const productsWithCategory = await Products.aggregate([
            {
                $match: {
                    categoryName: catname
                }
            },
            {
                $lookup: {
                    from: 'Category',  // Assuming the collection name for categories is 'categories'
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            }
        ]);
        // Send the response or do something with productsWithCategory
    } catch (err) {
        console.error('postFiltercat ----> ', err.message);
        // Handle the error
    }
};
