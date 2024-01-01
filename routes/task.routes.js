const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const ensureAuthenticated = require('../middlewares/auth.middleware');
const { uploadTaskAudio } = require('../middlewares/image.middleware');
//const { uploadAudioFile } = require('../middlewares/image.middleware'); // Import the uploadAudioFile middleware



router.post('/tasks', ensureAuthenticated, taskController.createTask);
router.get('/tasks', ensureAuthenticated, taskController.getTasksByUserId);
router.patch('/tasks/:taskId', ensureAuthenticated, taskController.updateTask);
router.delete('/tasks/:taskId', ensureAuthenticated, taskController.deleteTask);

router.post('/tasks/:taskId/audio', ensureAuthenticated, uploadTaskAudio.array('audios', 5), (req, res) => {
    console.log("Route reached");
    taskController.uploadTaskAudio(req, res);
  });

  // In task.routes.js
  router.get('/tasks/:taskId/audios', ensureAuthenticated, taskController.getTaskAudios);
// router.get('/tasks/:taskId/audios', ensureAuthenticated, taskController.getTaskAudios);
router.put('/tasks/:taskId/audios/:audioId', ensureAuthenticated, uploadTaskAudio.single('audio'), taskController.updateTaskAudio);
router.delete('/tasks/:taskId/audios/:audioId', ensureAuthenticated, taskController.deleteTaskAudio);


module.exports = router;
