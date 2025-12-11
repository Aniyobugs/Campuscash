// // model/coupon.js
// const mongoose = require("mongoose");

// const couponSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
//     code: { type: String, required: true, unique: true },
//     rewardName: { type: String, required: true },
//     pointsUsed: { type: Number, required: true },
//     isUsed: { type: Boolean, default: false },
//     expiresAt: { type: Date }, // optional expiry
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Coupon", couponSchema);


const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    code: { type: String, required: true, unique: true },

    rewardName: { type: String, required: true },

    pointsUsed: { type: Number, required: true },

    // --- Redeem (user side) ---
    redeemedAt: { type: Date, default: Date.now },  // when coupon was created

    // --- Store usage ---
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
    usedByStore: { type: String },                    // store name

    // --- Expiry ---
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
