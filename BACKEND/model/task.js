// model/task.js
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
    // Later: assignedTo, assignedBy, etc.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
