const request = require('supertest');
const app = require('../src/app');
const { resetTasks } = require('../src/routes/tasks');

describe('Tasks API Endpoints', () => {
  beforeEach(() => {
    resetTasks();
  });

  // Test 1: GET /tasks initially empty
  test('GET /tasks should return an empty array initially', async () => {
    const response = await request(app)
      .get('/tasks')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  // Test 2: POST /tasks successfully creates task
  test('POST /tasks should successfully create a new task', async () => {
    const taskData = { title: 'Test Task', description: 'Test Description' };
    const response = await request(app)
      .post('/tasks')
      .send(taskData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(taskData.title);
    expect(response.body.description).toBe(taskData.description);
    expect(response.body).toHaveProperty('createdAt');
  });

  // Test 3: POST /tasks validation error (missing title)
  test('POST /tasks should return 400 Bad Request if title is missing or empty', async () => {
    const emptyTitleTask = { title: '   ', description: 'No title' };
    let response = await request(app)
      .post('/tasks')
      .send(emptyTitleTask)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('title is required');

    const noTitleTask = { description: 'Missing title property completely' };
    response = await request(app)
      .post('/tasks')
      .send(noTitleTask)
      .expect(400);

    expect(response.body.error).toContain('title is required');
  });

  // Test 4: GET /tasks retrieves the created task
  test('GET /tasks should return the list containing any created tasks', async () => {
    // Insert a task
    await request(app)
      .post('/tasks')
      .send({ title: 'Task 1' });

    await request(app)
      .post('/tasks')
      .send({ title: 'Task 2', description: 'With description' });

    const response = await request(app)
      .get('/tasks')
      .expect(200);

    expect(response.body.length).toBe(2);
    expect(response.body[0].title).toBe('Task 1');
    expect(response.body[1].title).toBe('Task 2');
    expect(response.body[1].description).toBe('With description');
  });

  // Test 5: DELETE /tasks/:id successfully deletes a task
  test('DELETE /tasks/:id should delete the task by ID and return 200', async () => {
    // Create a task
    const createResponse = await request(app)
      .post('/tasks')
      .send({ title: 'Task to Delete' });

    const taskId = createResponse.body.id;

    // Delete it
    const deleteResponse = await request(app)
      .delete(`/tasks/${taskId}`)
      .expect(200);

    expect(deleteResponse.body).toHaveProperty('message');
    expect(deleteResponse.body.task.title).toBe('Task to Delete');

    // Confirm it's gone
    const getResponse = await request(app)
      .get('/tasks')
      .expect(200);

    expect(getResponse.body.length).toBe(0);
  });

  // Test 6: DELETE /tasks/:id returns 404 if not found
  test('DELETE /tasks/:id should return 404 if the task ID does not exist', async () => {
    const response = await request(app)
      .delete('/tasks/999')
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('not found');
  });

  // Test 7: DELETE /tasks/:id returns 400 for invalid ID format
  test('DELETE /tasks/:id should return 400 if the task ID format is invalid', async () => {
    const response = await request(app)
      .delete('/tasks/abc')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid task ID');
  });

  // Test 8: PATCH /tasks/:id/toggle successfully toggles task completion
  test('PATCH /tasks/:id/toggle should toggle task completed status', async () => {
    // Create a task
    const createResponse = await request(app)
      .post('/tasks')
      .send({ title: 'Task to Toggle' });

    const taskId = createResponse.body.id;
    expect(createResponse.body.completed).toBe(false);

    // Toggle to true
    let toggleResponse = await request(app)
      .patch(`/tasks/${taskId}/toggle`)
      .expect(200);

    expect(toggleResponse.body.completed).toBe(true);

    // Toggle back to false
    toggleResponse = await request(app)
      .patch(`/tasks/${taskId}/toggle`)
      .expect(200);

    expect(toggleResponse.body.completed).toBe(false);
  });

  // Test 9: PATCH /tasks/:id/toggle returns 404 for nonexistent task
  test('PATCH /tasks/:id/toggle should return 404 if the task ID does not exist', async () => {
    const response = await request(app)
      .patch('/tasks/999/toggle')
      .expect(404);

    expect(response.body.error).toContain('not found');
  });

  // Test 10: PATCH /tasks/:id/toggle returns 400 for invalid ID format
  test('PATCH /tasks/:id/toggle should return 400 if task ID format is invalid', async () => {
    const response = await request(app)
      .patch('/tasks/abc/toggle')
      .expect(400);

    expect(response.body.error).toContain('Invalid task ID');
  });
});
describe('Fallback /api endpoint handler', () => {
  test('GET /api/nonexistent should return 404 endpoint not found', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body.error).toBe('Endpoint not found.');
  });
});
