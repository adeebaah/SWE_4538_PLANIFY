const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  audios: [{ type: String }],
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  completed: { type: Boolean, default: false },
  
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
