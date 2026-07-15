const Category = require('../../model/categoryModel')
const fs = require('fs');
const Products = require('../../model/productModel');

exports.getProductList = async (req, res) => {
    try {
        const pdt = await Products.aggregate([
            {
                $match: {
                    isList: true
                }
            }
        ]);

        if (pdt) {
            const itemsPerPage = 6;
            const currentPage = req.query.page ? parseInt(req.query.page) : 1;
            const totalItems = pdt.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            const itemsToShow = pdt.slice(startIndex, endIndex);

            res.render('productManagement', {
                products: pdt,
                items: itemsToShow,
                totalPages: totalPages,
                currentPage: currentPage,
            });
        }
    } catch (err) {
        console.error("getProductListerr", err.message);
    }
};

exports.getAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({ isList: true });
        res.render('addProduct', { categories: categories });
    } catch (err) {
        console.error("getAddProduct error", err.message);
    }
};

exports.postAddProduct = async (req, res) => {
    try {
        const existing = await Products.findOne({ productName: req.body.productName });

        if (existing) {
            res.render('addProduct', { message: "Product already exists" });
        } else {
            const arrImages = [];
            for (let i = 0; i < req.files.length; i++) {
                arrImages[i] = req.files[i].filename;
            }
            const category = await Category.findOne({ categoryName: req.body.category });

            await Category.findOneAndUpdate({ categoryName: req.body.category }, { $inc: { quantity: 1 } });

            const product = await Products.insertMany([{
                productName: req.body.productName,
                price: Number(req.body.price),
                stock: Number(req.body.stock),
                description: req.body.description,
                discount: req.body.discount,
                category: category._id,
                images: arrImages
            }]);

            res.redirect('/admin/products');
        }
    } catch (err) {
        console.error("add product", err.message);
    }
};

exports.getEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Products.findOne({ _id: id });
        let pdtid = product.category.toString();
        let cat = await Category.findOne({ _id: product.category }, { categoryName: 1 });
        const categories = await Category.find({ isList: true });

        res.render('editProduct', { product: product, categoryName: cat.categoryName, pdtid, categories: categories });
    } catch (err) {
        console.error("getEditProduct", err.message);
    }
};

exports.deleteImages = async (req, res) => {
    try {
        let deleteimage = req.query.images;
        const id = req.query.id;

        await Products.updateOne({_id: id}, { $unset: { images: deleteimage } });
        const product = await Products.findOne({ _id: id });
        const categories = await Category.find({}, { categoryName: 1 });

        res.render('editProduct', { product, categories });
    } catch (err) {
        console.log("deleteImages", err.message);
    }
};

exports.postEditProduct = async (req, res) => {
    const price = Number(req.body.price);
    const stock = Number(req.body.stock);

    try {
        const pdtId = req.body.productIdentity;
        const arrImages = [];

        for (let i = 0; i < req.files.length; i++) {
            arrImages[i] = req.files[i].filename;
        }

        const imgs = await Products.find({ _id: pdtId }, { images: 1, _id: 0 });

        if (imgs.length > 0) {
            const [{ images }] = imgs;

            images.forEach(item => {
                arrImages.push(item);
            });
        }

        const filterImages = arrImages.filter((item, index) => { return arrImages.indexOf(item) === index; });

        const catId = await Category.findOne({ categoryName: req.body.selectcategory }, { _id: 1 });

        let data;
        
        if (stock <= 0) {
            // If stock is zero or negative, handle it accordingly
            data = await Products.updateOne({ _id: pdtId }, {
                $set: {
                    productName: req.body.productName,
                    price: price,
                    stock: 0, // Set stock as 0 to indicate out of stock
                    description: req.body.description,
                    discount: req.body.discount,
                    category: req.body.category,
                    images: filterImages
                }
            });
        } else {
            // If stock is positive, update normally
            data = await Products.updateOne({ _id: pdtId }, {
                $set: {
                    productName: req.body.productName,
                    price: price,
                    stock: stock,
                    description: req.body.description,
                    discount: req.body.discount,
                    category: req.body.category,
                    images: filterImages
                }
            });
        }

        res.redirect('/admin/products');
    } catch (err) {
        console.log("postEditProduct", err.message);
    }
};

exports.getProductDelete = async (req, res) => {
    try {
        const id = req.query.id;

        const product = await Products.findOne({ _id: id });
        // Ensure stock doesn't go below zero
        const newQuantity = Math.max(0, product.stock - 1);
        await Category.findByIdAndUpdate({ _id: product.category }, { $inc: { quantity: -1 } });
        await Products.findByIdAndDelete({ _id: id }, { $set: { isList: false } });

        res.redirect('/admin/products');
    } catch (err) {
        console.error("getProductDelete", err.message);
    }
};


exports.getSearch = async (req, res) => {
    const searchQuery = new RegExp("^" + req.body.search, "i");

    Products.find({ productName: { $regex: searchQuery } }).then((pdt) => {
        if (pdt.length === 0) {
            const itemsPerPage = 6;
            const currentPage = req.query.page ? parseInt(req.query.page) : 1;
            const totalItems = pdt.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            const itemsToShow = pdt.slice(startIndex, endIndex);

            res.render('productManagement', {
                products: [],
                items: itemsToShow,
                totalPages: totalPages,
                currentPage: currentPage,
            });
        } else {
            const itemsPerPage = 6;
            const currentPage = req.query.page ? parseInt(req.query.page) : 1;
            const totalItems = pdt.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            const itemsToShow = pdt.slice(startIndex, endIndex);

            res.render('productManagement', {
                products: pdt,
                items: itemsToShow,
                totalPages: totalPages,
                currentPage: currentPage,
            });
        }
    });
};
