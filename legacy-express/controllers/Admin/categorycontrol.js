const Category = require("../../model/categoryModel")
exports.getCategoryList = async (req, res) => {
  try {
    const cat = await Category.aggregate([
      {
        $match: {
          isList: true,
        },
      },
    ]);
    if (cat) {
      const itemsPerPage = 6; // Set the desired number of items per page
      const currentPage = req.query.page ? parseInt(req.query.page) : 1;
      const totalItems = cat.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      // Calculate the startIndex and endIndex to load exactly 'itemsPerPage' items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Slice the array to get items for the current page, ensuring 'itemsPerPage' items
      const itemsToShow = cat.slice(startIndex, endIndex);

      res.render("categoryManagement", {
        categories: cat,
        items: itemsToShow,

        totalPages: totalPages, 
        currentPage: currentPage,
      });
    }
  } catch (err) {
    console.error("getCategoryList", err);
  }
};
exports.getCategoryDelete = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    await Category.findByIdAndDelete({ _id: id });
console.log( Category);
    res.redirect("/admin/category");
  } catch (err) {
    console.error(err);
  }
};

exports.getCategoryEditModal = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findOne({ _id: id });
    console.log(category);
    res.render("editCategory", { check: category });
  } catch (err) {
    console.error(err);
  }
};


exports.postCategoryListEdit = async (req, res) => {
  try {
   
    const catId = req.body.categoryid;
    console.log(req.body);
    const category = await Category.findByIdAndUpdate(
   catId,
      { 
        categoryName: req.body.categoryName
       
      }
    );
    console.log(category);
    res.redirect("/admin/category");
  } catch (err) {
    console.error(err);
  }
};

exports.getCategoryAddCat = async (req, res) => {
  res.render("addCategory");
};

exports.postCategoryAddCat = async (req, res) => {
  console.log(req.body);

  try {
    const existing = await Category.findOne({
      categoryName: req.body.categoryName
    });

    if (existing) {
      res.render("addCategory", { message: "Category already exists" });
    } else {
     
      const category = await Category.insertMany([
        {
          categoryName: req.body.categoryName,
          description: req.body.description,
          image: req.file.filename,
        },
      ]);

      res.redirect("/admin/category");
    }
  } catch (err) {
    console.error("add product", err.message);
  }

  
};
exports.getSearch = async (req, res) => {
  const searchQuery = new RegExp("^" + req.body.search, "i"); // Adding "i" flag for case-insensitive search

  Category.find({ categoryName: { $regex: searchQuery }, isList: true }).then(
    (cat) => {
      if (cat.length === 0) {
        res.render("categoryManagement", { categories: [] });
      } else {
        res.render("categoryManagement", { categories: cat });
      }
    }
  );
};
