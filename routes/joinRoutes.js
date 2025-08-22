const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Room = require("../models/Room");

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

// dynamic DB per roomId
function getJoinModel(roomId) {
  const dbName = `room_${roomId}`; // database named with room id
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roomwala";
  // derive base from uri, but simplest: host part from existing uri
  const host = uri.split("/")[2] || "127.0.0.1:27017";
  const protocol = uri.split("://")[0] || "mongodb";
  const connUri = `${protocol}://${host}/${dbName}`;
  const conn = mongoose.createConnection(connUri);

  const memberSchema = new mongoose.Schema({
    role: String, // leader or teammate
    bgmiId: String,
    bgmiUsername: String,
    email: String,
    mobile: String
  }, { _id: false });

  const teamSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    matchType: { type: String, enum: ["solo", "duo", "squad"], required: true },
    leader: memberSchema,
    teammates: [memberSchema]
  }, { timestamps: true });

  return conn.model(`Join_${roomId}`, teamSchema);
}

router.post("/:roomId/join", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).send("Room not found");

    const { leader, teammates } = req.body; // leader: {username,bgmiId,bgmiUsername,email,mobile}; teammates: array
    if (!leader?.bgmiId || !leader?.bgmiUsername || !leader?.email) {
      return res.status(400).send("Leader details are incomplete");
    }

    // Create join record in dedicated DB
    const JoinModel = getJoinModel(roomId);
    const doc = await JoinModel.create({
      roomId,
      matchType: room.matchType,
      leader,
      teammates: teammates || []
    });

    // increment playersJoined by team size
    const increment = room.matchType === "squad" ? 4 : room.matchType === "duo" ? 2 : 1;
    room.playersJoined += increment;
    await room.save();

    // send email
    const transporter = getTransporter();
    const lines = [
      `You have joined room ${room.roomName} (ID: ${room.roomId}).`,
      `Game: ${room.game}`,
      `Map: ${room.map}`,
      `Type: ${room.matchType}`,
      `Entry Fee: ₹${room.entryFee}`,
      `Start Time: ${new Date(room.startTime).toLocaleString()}`,
      `Description:\n${room.description}`
    ];
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: leader.email,
        subject: `Joined Room ${room.roomName} (${room.roomId})`,
        text: lines.join("\n")
      });
    }

    res.json({ ok: true, joinId: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
