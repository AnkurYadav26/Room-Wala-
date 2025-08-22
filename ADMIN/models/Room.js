const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  game: { type: String, default: "bgmi" },
  roomId: { type: String, required: true, unique: true, index: true },
  roomName: { type: String, required: true },
  map: { type: String, required: true },
  matchType: { type: String, enum: ["solo", "duo", "squad"], required: true },
  entryFee: { type: Number, required: true },
  startTime: { type: Date, required: true },
  description: { type: String, required: true },
  playersJoined: { type: Number, default: 0 },
  image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Room", RoomSchema);
