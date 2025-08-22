const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin-login.html"));
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.redirect("/admin");
  }
  return res.status(401).send("Invalid credentials");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});

module.exports = router;
