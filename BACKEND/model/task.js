const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      default: "General",
    },
    // You can later link tasks to users or faculty:
    // assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Task", taskSchema);
