// model/coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true, unique: true },
    rewardName: { type: String, required: true },
    pointsUsed: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date }, // optional expiry
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
