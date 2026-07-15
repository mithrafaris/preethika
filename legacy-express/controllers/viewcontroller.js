const userDB = require("../model/userdetails_model");
const Category = require('../model/categoryModel')

exports.user_login = (req, res) => {
  res.render("user_login", { title: "Flybees" });
};
exports.user_signup = (req, res) => {
  res.render("user_signup", { title: "Flybees" });
};

//ADMIN
exports.user_details = async (req, res) => {
  try {
    const result = await userDB.find({});
    console.log(result);
    res.render("user_details", { title: "Flybees", user: result });
  } catch (error) {
    res.send(error.message);
  }
};

exports.productsDetails = (req, res) => {
  res.render("productsDetails", { title: "Flybees" });
};

exports.dashboard = (req, res) => {
  res.render("dashboard", { title: "Flybees" });
};
exports.Adminlogin = (req, res) => {
  res.render("Adminlogin", { title: "Flybees" });
};

exports.categoryManagement = async (req, res) => {
  try {
    const result = await Category.find({});
    console.log("no category found", result);
    res.render("categoryManagement", { title: "Flybees" });
  } catch (error) {
    res.send(error.message);
  }
};
exports.addCategory = (req, res) => {
  res.render("addCategory", { title: "Flybees" });
};
