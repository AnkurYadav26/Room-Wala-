require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const roomsRoutes = require("./routes/roomRoutes");
const joinRoutes = require("./routes/joinRoutes");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT =  3000;

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roomwala")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/join", joinRoutes);

// guarded static pages
app.get("/admin.html", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin.html"));
});
app.get("/bgmi.html", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "public/bgmi.html"));
});

// default -> login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
