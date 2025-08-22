const express = require("express");
const path = require("path");
const Room = require("../models/Room");

const router = express.Router();

function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect("/auth/login");
}

// Serve admin panel
router.get("/", isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
});

// Create a room
router.post("/add-room", isAdmin, async (req, res) => {
  try {
    const { roomId, roomName, map, matchType, entryFee, startTime, description, image } = req.body;

    const required = { roomId, roomName, map, matchType, entryFee, startTime, description, image };
    for (const [k, v] of Object.entries(required)) {
      if (v === undefined || v === null || String(v).trim() === "") {
        return res.status(400).send(`${k} is required`);
      }
    }

    const room = new Room({
      game: "bgmi",
      roomId: String(roomId),
      roomName,
      map,
      matchType,
      entryFee: Number(entryFee),
      startTime: new Date(startTime),
      description,
      playersJoined: 0,
      image
    });

    await room.save();
    res.send("Room created successfully!");
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).send("roomId already exists");
    }
    console.error("Create room error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
