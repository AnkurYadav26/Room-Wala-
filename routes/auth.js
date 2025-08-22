const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// helper mailer
function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
}

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirm } = req.body;
    if (!username || !email || !password) {
      return res.status(400).send("All fields are required.");
    }
    if (password !== confirm) {
      return res.status(400).send("Passwords do not match.");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).send("Username or Email already in use.");

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    return res.redirect("/login.html");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error: " + err.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).send("All fields are required.");
    }

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (!user) return res.status(400).send("User not found.");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).send("Invalid credentials.");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.redirect("/admin.html");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error: " + err.message);
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login.html");
});

// Forgot Password
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send("Email is required.");

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found.");

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const base = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const resetUrl = `${base}/reset.html?token=${resetToken}`;

    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        text: `Click to reset your password: ${resetUrl}`
      });
      return res.send("Password reset link sent to your email.");
    } else {
      console.warn("EMAIL_USER/EMAIL_PASS not set. Skipping email send.");
      return res.send(`Email disabled. Use this reset link manually: ${resetUrl}`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error: " + err.message);
  }
});

// Reset Password
router.post("/reset/:token", async (req, res) => {
  try {
    const { password, confirm } = req.body;
    if (!password || !confirm) return res.status(400).send("All fields are required.");
    if (password !== confirm) return res.status(400).send("Passwords do not match.");

    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) return res.status(400).send("Invalid or expired token.");

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.send("Password reset successful. You can now login.");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error: " + err.message);
  }
});

// Check auth (for front-end guard if needed)
router.get("/check", (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ ok: false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ ok: true, userId: decoded.id });
  } catch (e) {
    return res.status(401).json({ ok: false });
  }
});

module.exports = router;
