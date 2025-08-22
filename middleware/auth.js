const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      // not authenticated – redirect to login page for browser
      return res.status(401).redirect("/login.html");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).redirect("/login.html");
  }
};
