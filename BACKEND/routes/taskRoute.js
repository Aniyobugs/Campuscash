// routes/taskRoute.js
const express = require("express");
const router = express.Router();
const Task = require("../model/task");

// POST /api/tasks/addtask  – create a new task
router.post("/addtask", async (req, res) => {
  try {
    const { title, description, dueDate, points, category } = req.body;

    if (!title || !dueDate || !points) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const newTask = new Task({
      title,
      description,
      // ensure Date format
      dueDate: new Date(dueDate),
      points,
      category: category || "General",
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

// GET /api/tasks/active – only tasks whose dueDate is in the future
router.get("/active", async (req, res) => {
  try {
    const now = new Date();

    const tasks = await Task.find({
      dueDate: { $gte: now },
    }).sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching active tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
