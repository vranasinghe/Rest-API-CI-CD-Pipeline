const express = require('express');
const router = express.Router();

// In-memory tasks array database
let tasks = [];
let nextId = 1;

// GET /tasks - Get all tasks
router.get('/', (req, res) => {
  res.status(200).json(tasks);
});

// POST /tasks - Create a task
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required and must be a non-empty string.' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: (description && typeof description === 'string') ? description.trim() : '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PATCH /tasks/:id/toggle - Toggle task completed status
router.patch('/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID format.' });
  }

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  task.completed = !task.completed;
  res.status(200).json(task);
});

// DELETE /tasks/:id - Delete a task by ID
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID format.' });
  }

  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.status(200).json({ message: 'Task deleted successfully.', task: deletedTask });
});

// Helper for tests to reset state
const resetTasks = () => {
  tasks = [];
  nextId = 1;
};

module.exports = {
  router,
  resetTasks,
  getTasks: () => tasks
};
