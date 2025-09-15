// routes/progress.js
const express = require("express");
const router = express.Router();
const Progress = require("../models/progress");

// get progress for a user
router.get("/:userId", async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.params.userId }).populate("user");
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update points
router.post("/:userId/addpoints", async (req, res) => {
  try {
    const { points } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { user: req.params.userId },
      { $inc: { points: points } },
      { new: true, upsert: true }
    );
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
