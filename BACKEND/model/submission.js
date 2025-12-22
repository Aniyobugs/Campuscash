const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  type: { type: String, enum: ['file', 'link', 'text', 'quiz'], required: true },
  text: { type: String },
  link: { type: String },
  filePath: { type: String },
  // quiz-specific
  answers: { type: [Number] }, // indexes of selected options
  score: { type: Number }, // percent score 0-100
  passed: { type: Boolean },

  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  adminComment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
