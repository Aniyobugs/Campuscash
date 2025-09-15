// models/progress.js
var mongoose = require("mongoose");

var progressSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  nextReward: {
    name: { type: String },
    total: { type: Number, default: 1000 },
  },
  streak: {
    days: { type: Number, default: 0 },
    badge: { type: String },
  },
});

var progressModel = mongoose.model("progress", progressSchema);
module.exports = progressModel;
