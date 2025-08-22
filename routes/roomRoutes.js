const express = require("express");
const Room = require("../models/Room");
const auth = require("../middleware/auth");

const router = express.Router();

// Get rooms for a game
router.get("/", async (req, res) => {
  try {
    const { game } = req.query;
    const filter = game ? { game } : {};
    const rooms = await Room.find(filter).sort({ startTime: 1 });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Create a room (optional future use) - keep protected
router.post("/", auth, async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
