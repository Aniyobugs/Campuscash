
const express = require("express");
const router = express.Router();
const Task = require("../model/task"); // Make sure this path is correct

// POST a new task
router.post("/addtask", async (req, res) => {
  try {
    const { title, description, dueDate, points, category } = req.body;

    // Validation
    if (!title || !dueDate || !points) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      points,
      category,
    });

    await newTask.save();

    res.status(201).json({
      message: "Task created successfully!",
      task: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
