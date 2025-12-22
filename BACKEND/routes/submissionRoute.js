const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Submission = require('../model/submission');
const Task = require('../model/task');
const User = require('../model/user');

// disk storage to /uploads/submissions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// POST /api/tasks/:id/submit
router.post('/tasks/:id/submit', upload.single('file'), async (req, res) => {
  try {
    const taskId = req.params.id;
    const { type, text, link, answers } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // User id expected in body (or from auth) — here client will send userId
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    if (!['file', 'link', 'text', 'quiz'].includes(type)) {
      return res.status(400).json({ message: 'Invalid submission type' });
    }

    const submissionData = { task: taskId, user: userId, type };

    if (type === 'text') submissionData.text = text || '';
    if (type === 'link') submissionData.link = link || '';
    if (type === 'file' && req.file) submissionData.filePath = `/uploads/${req.file.filename}`;

    // quiz handling (answers expected as JSON array or array of numbers)
    if (type === 'quiz') {
      // ensure task has quiz
      if (!task.quiz || !Array.isArray(task.quiz.questions) || task.quiz.questions.length === 0) {
        return res.status(400).json({ message: 'Task is not configured as a quiz' });
      }

      let parsedAnswers = answers;
      // if answers come as string (JSON), try to parse
      if (typeof parsedAnswers === 'string') {
        try {
          parsedAnswers = JSON.parse(parsedAnswers);
        } catch (e) {
          // if CSV like '0,1,2' parse
          parsedAnswers = String(parsedAnswers).split(',').map((s) => parseInt(s, 10));
        }
      }

      if (!Array.isArray(parsedAnswers)) return res.status(400).json({ message: 'Answers must be an array' });

      const total = task.quiz.questions.length;
      // ensure same length
      if (parsedAnswers.length !== total) {
        return res.status(400).json({ message: `Answers length (${parsedAnswers.length}) does not match question count (${total})` });
      }

      // score calculation
      let correctCount = 0;
      task.quiz.questions.forEach((q, idx) => {
        if (Number(parsedAnswers[idx]) === Number(q.correctIndex)) correctCount++;
      });

      const percent = Math.round((correctCount / total) * 100);
      const passing = (task.quiz.passingScore || 70);
      const passed = percent >= passing;

      submissionData.answers = parsedAnswers;
      submissionData.score = percent;
      submissionData.passed = passed;
      submissionData.status = passed ? 'accepted' : 'rejected';
    }

    const submission = new Submission(submissionData);
    await submission.save();

    // If quiz and passed, award points immediately (idempotent)
    let awardedUser = null;
    if (submission.type === 'quiz' && submission.passed) {
      const user = await User.findById(userId);
      if (user) {
        // prevent double-awarding: check if task.awardedTo already contains this user
        const taskObj = await Task.findById(taskId);
        const already = (taskObj.awardedTo || []).some((a) => String(a.user) === String(user._id));
        if (!already) {
          user.points = (user.points || 0) + (taskObj.points || 0);
          await user.save();

          taskObj.awardedTo = taskObj.awardedTo || [];
          taskObj.awardedTo.push({ user: user._id, awardedAt: new Date() });
          await taskObj.save();
        }
        awardedUser = user;
      }
    }

    res.status(201).json({ message: 'Submission created', submission, user: awardedUser });
  } catch (err) {
    console.error('Submit error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/submissions - admin: list all submissions
router.get('/submissions', async (req, res) => {
  try {
    const subs = await Submission.find().populate('task').populate('user').sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tasks/:id/submissions - list submissions per task
router.get('/tasks/:id/submissions', async (req, res) => {
  try {
    const subs = await Submission.find({ task: req.params.id }).populate('user').sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/submissions/:id/approve - accept and award points
router.put('/submissions/:id/approve', async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id).populate('task').populate('user');
    if (!sub) return res.status(404).json({ message: 'Submission not found' });

    if (sub.status === 'accepted') return res.status(400).json({ message: 'Already accepted' });

    // award points — ensure it's not double-awarded
    const taskPoints = (sub.task && sub.task.points) || 0;
    const user = sub.user;

    // increase user points
    user.points = (user.points || 0) + taskPoints;
    await user.save();

    // mark submission accepted
    sub.status = 'accepted';
    sub.adminComment = req.body.adminComment || '';
    await sub.save();

    // also add awarded record to task.awardedTo if not present
    const awarded = sub.task.awardedTo || [];
    if (!awarded.some((a) => String(a.user) === String(user._id))) {
      sub.task.awardedTo = sub.task.awardedTo || [];
      sub.task.awardedTo.push({ user: user._id, awardedAt: new Date() });
      await sub.task.save();
    }

    res.json({ message: `Awarded ${taskPoints} points to ${user.fname}`, submission: sub, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/submissions/:id/reject
router.put('/submissions/:id/reject', async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });

    sub.status = 'rejected';
    sub.adminComment = req.body.adminComment || '';
    await sub.save();

    res.json({ message: 'Submission rejected', submission: sub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
