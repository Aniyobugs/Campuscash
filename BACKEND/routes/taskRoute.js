// routes/taskRoute.js
const express = require("express");
const router = express.Router();
const Task = require("../model/task");
const User = require("../model/user");

// POST /api/tasks/addtask  – create a new task
router.post("/addtask", async (req, res) => {
  try {
    const { title, description, dueDate, points, category, assignedYears, quiz } = req.body;

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
      assignedYears: Array.isArray(assignedYears) ? assignedYears : [],
    });

    // attach quiz if provided and category indicates Quiz
    if ((category && String(category).toLowerCase() === 'quiz') || quiz) {
      // basic validation
      if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        return res.status(400).json({ message: 'Quiz requires at least one question' });
      }
      newTask.quiz = quiz;
    }

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

    const filter = { dueDate: { $gte: now } };

    // If a year query param is provided, return tasks that either target that year
    // or are global (assignedYears is empty).
    const { year } = req.query;
    if (year) {
      console.debug("/api/tasks/active: filtering for year param:", year);

      // Build a flexible set of match patterns for the user's year string so
      // tasks assigned with tokens like "3", "3rd", "third" or "3rd year"
      // will match.
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
      const tokens = new Set();
      const y = String(year).trim();
      if (y) tokens.add(escapeRegex(y));

      // numeric part, e.g. "3rd year" -> "3"
      const num = (y.match(/\d+/) || [])[0];
      if (num) {
        tokens.add(escapeRegex(num));
        tokens.add(escapeRegex(num + "th"));
        tokens.add(escapeRegex(num + "rd"));
        tokens.add(escapeRegex(num + "st"));
        tokens.add(escapeRegex(num + "nd"));
      }

      // common word numbers
      const numberWords = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
      const cleaned = y.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
      Object.keys(numberWords).forEach((word) => {
        if (cleaned.includes(word)) {
          tokens.add(escapeRegex(word));
          tokens.add(escapeRegex(String(numberWords[word])));
        }
      });

      // match either global tasks or any assignedYears element matching one of the tokens
      const pattern = Array.from(tokens).join("|");
      filter.$or = [{ assignedYears: { $size: 0 } }, { assignedYears: { $regex: `\\b(${pattern})\\b`, $options: "i" } }];
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching active tasks:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ADMIN: list all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error listing tasks:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// ADMIN: get candidate users for a specific task (by task id)
router.get("/:id/candidates", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    let users;
    if (!task.assignedYears || task.assignedYears.length === 0) {
      users = await User.find({ status: { $ne: "inactive" } }).select(
        "fname ename studentId yearClassDept points profilePic"
      );
    } else {
      // If assignedYears explicitly includes 'all', return all non-inactive users
      const includesAll = task.assignedYears.some((y) => String(y).trim().toLowerCase() === "all");
      if (includesAll) {
        users = await User.find({ status: { $ne: "inactive" } }).select(
          "fname ename studentId yearClassDept points profilePic status"
        );
      } else {
        // Build a flexible set of tokens to match against `yearClassDept`.
        // Support numeric matches (3), ordinals (3rd), and word numbers (third).
        const numberWords = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };

        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&");

        const patterns = new Set();

        task.assignedYears.forEach((yRaw) => {
          if (!yRaw) return;
          const y = String(yRaw).trim();
          // original token
          patterns.add(escapeRegex(y));

          // numeric part
          const num = (y.match(/\d+/) || [])[0];
          if (num) {
            patterns.add(escapeRegex(num));
            patterns.add(escapeRegex(num + "th"));
            patterns.add(escapeRegex(num + "rd"));
            patterns.add(escapeRegex(num + "st"));
            patterns.add(escapeRegex(num + "nd"));
          }

          // word number (first, second, third)
          const cleaned = y.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
          Object.keys(numberWords).forEach((word) => {
            if (cleaned.includes(word)) {
              patterns.add(escapeRegex(word));
              patterns.add(escapeRegex(String(numberWords[word])));
            }
          });
        });

        const or = Array.from(patterns).map((p) => ({ yearClassDept: { $regex: `\\b${p}\\b`, $options: "i" } }));

        users = await User.find({ $or: or, status: { $ne: "inactive" } }).select(
          "fname ename studentId yearClassDept points profilePic status"
        );
      }
    }

    // mark awarded flag
    const awardedIds = (task.awardedTo || []).map((a) => String(a.user));
    const response = users.map((u) => ({ ...u.toObject(), awarded: awardedIds.includes(String(u._id)) }));

    res.json(response);
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ADMIN: award a task to a specific user
router.post("/:id/award", async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent double-awarding
    if ((task.awardedTo || []).some((a) => String(a.user) === String(user._id))) {
      return res.status(400).json({ message: "User already awarded for this task" });
    }

    // If task targets specific years, ensure user's year matches
    if (task.assignedYears && task.assignedYears.length > 0) {
      const matches = task.assignedYears.some((y) => {
        try {
          return new RegExp(y, "i").test(user.yearClassDept || "");
        } catch (e) {
          return String(user.yearClassDept || "").toLowerCase().includes(String(y).toLowerCase());
        }
      });
      if (!matches) {
        return res.status(400).json({ message: "User does not belong to the task's assigned years" });
      }
    }

    // award points
    user.points = (user.points || 0) + (task.points || 0);
    await user.save();

    task.awardedTo = task.awardedTo || [];
    task.awardedTo.push({ user: user._id, awardedAt: new Date() });
    await task.save();

    res.json({ message: `Awarded ${task.points} points to ${user.fname}`, user, task });
  } catch (err) {
    console.error("Error awarding task:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
