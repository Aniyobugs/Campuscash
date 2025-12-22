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
    assignedYears: {
      type: [String],
      default: [],
    },
    awardedTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        awardedAt: { type: Date },
      },
    ],
    // Quiz support: optional for tasks with category 'quiz'
    quiz: {
      questions: [
        {
          text: { type: String, required: true },
          options: { type: [String], required: true },
          // index into options array
          correctIndex: { type: Number, required: true },
        },
      ],
      // percentage required to pass (0-100). If not set default to 70
      passingScore: { type: Number, default: 70 },
    },
    // Later: assignedTo, assignedBy, etc.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
