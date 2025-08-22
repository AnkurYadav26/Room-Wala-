const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    game: { type: String, required: true }, // e.g., "bgmi"
    roomId: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    map: { type: String, required: true },
    matchType: { type: String, enum: ["solo", "duo", "squad"], required: true },
    entryFee: { type: Number, required: true },
    startTime: { type: Date, required: true },
    description: { type: String, default: "" },
    playersJoined: { type: Number, default: 0 },
    image: { type: String, default: "/images/bgmi.jpg" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
