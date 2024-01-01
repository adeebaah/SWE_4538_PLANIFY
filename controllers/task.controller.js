const Task = require('../dataModels/Task.model');

exports.createTask = async (req, res) => {
    const { title, description, dueDate, priority } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        const newTask = new Task({ userId, title, description, dueDate, priority });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTasksByUserId = async (req, res) => {
    const userId = req.user.id;

    try {
        const tasks = await Task.find({ userId });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, dueDate, priority, completed } = req.body;

    try {
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;
        task.completed = (completed !== undefined) ? completed : task.completed;
        await task.save();

        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findByIdAndDelete(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadTaskAudio = async (req, res) => {
    try {
      const taskId = req.params.taskId;
      if (!req.files) {
        return res.status(400).json({ message: 'No audio file provided' });
      }
  
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      const audioFiles = req.files.map(file => file.filename);
      task.audios = task.audios.concat(audioFiles);
      await task.save();
  
      res.json({ message: 'Audio uploaded successfully', task });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.getTaskAudios = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ audios: task.audios });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTaskAudio = async (req, res) => {
    const { taskId, audioId } = req.params;

    try {
        const task = await Task.findById(taskId);

        if (!task || !task.audios.includes(audioId)) {
            return res.status(404).json({ message: 'Task or audio not found' });
        }

        // Assuming req.file contains the new audio file
        const newAudio = req.file.filename;
        const index = task.audios.indexOf(audioId);
        task.audios[index] = newAudio;

        await task.save();
        res.json({ message: 'Audio updated successfully', task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTaskAudio = async (req, res) => {
    const { taskId, audioId } = req.params;

    try {
        const task = await Task.findById(taskId);

        if (!task || !task.audios.includes(audioId)) {
            return res.status(404).json({ message: 'Task or audio not found' });
        }

        task.audios = task.audios.filter(audio => audio !== audioId);
        await task.save();

        res.json({ message: 'Audio deleted successfully', task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

