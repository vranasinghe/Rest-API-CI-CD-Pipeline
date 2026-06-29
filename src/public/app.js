document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskTitle = document.getElementById('task-title');
  const taskDesc = document.getElementById('task-desc');
  const tasksContainer = document.getElementById('tasks-container');
  const taskCounter = document.getElementById('task-counter');
  const toast = document.getElementById('notification-toast');

  // Fetch all tasks on load
  fetchTasks();

  // Form submit handler
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const description = taskDesc.value.trim();

    if (!title) return;

    try {
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      await response.json();
      showToast('Task added successfully!', 'success');
      taskForm.reset();
      fetchTasks(); // Refresh list
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Fetch tasks helper
  async function fetchTasks() {
    try {
      const response = await fetch('/tasks');
      if (!response.ok) throw new Error('Failed to load tasks');
      const tasks = await response.json();
      renderTasks(tasks);
    } catch (err) {
      showToast(err.message, 'error');
      tasksContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">⚠️</span>
          <p>Error loading tasks. Please try again later.</p>
        </div>
      `;
    }
  }

  // Render tasks in DOM
  function renderTasks(tasks) {
    taskCounter.textContent = `${tasks.length} Task${tasks.length === 1 ? '' : 's'}`;

    if (tasks.length === 0) {
      tasksContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📂</span>
          <p>No tasks found. Create one to get started!</p>
        </div>
      `;
      return;
    }

    tasksContainer.innerHTML = '';
    tasks.forEach(task => {
      const formattedDate = new Date(task.createdAt).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short'
      });

      const card = document.createElement('div');
      card.className = `task-card ${task.completed ? 'completed' : ''}`;
      card.innerHTML = `
        <button class="btn-toggle-status" data-id="${task.id}" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
          <div class="custom-checkbox ${task.completed ? 'checked' : ''}">
            ${task.completed ? '✓' : ''}
          </div>
        </button>
        <div class="task-content">
          <h3 class="task-title-line">${escapeHTML(task.title)}</h3>
          ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ''}
          <div class="task-meta">Created on: ${formattedDate}</div>
        </div>
        <button class="btn-delete" data-id="${task.id}" title="Delete Task">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      `;

      // Set up toggle event
      card.querySelector('.btn-toggle-status').addEventListener('click', async () => {
        await toggleTask(task.id);
      });

      // Set up delete event
      card.querySelector('.btn-delete').addEventListener('click', async () => {
        await deleteTask(task.id);
      });

      tasksContainer.appendChild(card);
    });
  }

  // Toggle task helper
  async function toggleTask(id) {
    try {
      const response = await fetch(`/tasks/${id}/toggle`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Failed to toggle task status');
      
      showToast('Task updated.', 'success');
      fetchTasks(); // Refresh list
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Delete task helper
  async function deleteTask(id) {
    try {
      const response = await fetch(`/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      showToast('Task deleted.', 'success');
      fetchTasks(); // Refresh list
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Toast Helper
  let toastTimeout;
  function showToast(message, type = 'success') {
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    // Smooth reveal
    toast.classList.remove('hidden');

    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  // Escape HTML helper to prevent XSS
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
