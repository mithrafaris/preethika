exports.is_Adminloggin = (req, res, next) => {
  if (req.session.adminId) {
    next();
  } else {
    res.redirect("Dashboard");
  }
};
module.exports.isAdminLoggedIn = (req, res, next) => {
  if (req.session.adminId) {
    next();
  } else {
    res.redirect("Dashboard");
  }
};
