const { query } = require('../config/database');

/**
 * Task Service
 * Handles business logic for task operations
 */

/**
 * Get all tasks with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of tasks
 */
const getAllTasks = async (filters = {}) => {
  const {
    status,
    priority,
    assigned_to,
    created_by,
    company_id,
    contact_id,
    deal_id,
    limit = 50,
    offset = 0
  } = filters;

  let sql = `
    SELECT
      t.*,
      u1.first_name as assigned_to_first_name,
      u1.last_name as assigned_to_last_name,
      u1.email as assigned_to_email,
      u2.first_name as created_by_first_name,
      u2.last_name as created_by_last_name,
      c.name as company_name,
      ct.first_name as contact_first_name,
      ct.last_name as contact_last_name,
      d.title as deal_title
    FROM tasks t
    LEFT JOIN users u1 ON t.assigned_to = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN companies c ON t.company_id = c.id
    LEFT JOIN contacts ct ON t.contact_id = ct.id
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (status) {
    sql += ` AND t.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (priority) {
    sql += ` AND t.priority = $${paramCount}`;
    params.push(priority);
    paramCount++;
  }

  if (assigned_to) {
    sql += ` AND t.assigned_to = $${paramCount}`;
    params.push(assigned_to);
    paramCount++;
  }

  if (created_by) {
    sql += ` AND t.created_by = $${paramCount}`;
    params.push(created_by);
    paramCount++;
  }

  if (company_id) {
    sql += ` AND t.company_id = $${paramCount}`;
    params.push(company_id);
    paramCount++;
  }

  if (contact_id) {
    sql += ` AND t.contact_id = $${paramCount}`;
    params.push(contact_id);
    paramCount++;
  }

  if (deal_id) {
    sql += ` AND t.deal_id = $${paramCount}`;
    params.push(deal_id);
    paramCount++;
  }

  sql += ` ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`;
  sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get single task by ID
 * @param {number|string} id - Task ID
 * @returns {Promise<Object|null>} Task object or null if not found
 */
const getTaskById = async (id) => {
  const sql = `
    SELECT
      t.*,
      u1.first_name as assigned_to_first_name,
      u1.last_name as assigned_to_last_name,
      u1.email as assigned_to_email,
      u2.first_name as created_by_first_name,
      u2.last_name as created_by_last_name,
      c.name as company_name,
      ct.first_name as contact_first_name,
      ct.last_name as contact_last_name,
      d.title as deal_title
    FROM tasks t
    LEFT JOIN users u1 ON t.assigned_to = u1.id
    LEFT JOIN users u2 ON t.created_by = u2.id
    LEFT JOIN companies c ON t.company_id = c.id
    LEFT JOIN contacts ct ON t.contact_id = ct.id
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE t.id = $1
  `;

  const result = await query(sql, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Create new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
const createTask = async (taskData) => {
  const {
    title,
    description,
    status = 'pending',
    priority = 'medium',
    due_date,
    assigned_to,
    created_by,
    company_id,
    contact_id,
    deal_id
  } = taskData;

  // Validation
  if (!title) {
    throw new Error('Title is required');
  }

  const sql = `
    INSERT INTO tasks (
      title, description, status, priority, due_date,
      assigned_to, created_by, company_id, contact_id, deal_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const params = [
    title,
    description,
    status,
    priority,
    due_date,
    assigned_to,
    created_by,
    company_id,
    contact_id,
    deal_id
  ];

  const result = await query(sql, params);
  return result.rows[0];
};

/**
 * Update task
 * @param {number|string} id - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
const updateTask = async (id, updates) => {
  const {
    title,
    description,
    status,
    priority,
    due_date,
    assigned_to,
    company_id,
    contact_id,
    deal_id
  } = updates;

  // Check if task exists
  const existingTask = await getTaskById(id);
  if (!existingTask) {
    return null;
  }

  // Build dynamic update query
  const updateFields = [];
  const params = [];
  let paramCount = 1;

  if (title !== undefined) {
    updateFields.push(`title = $${paramCount}`);
    params.push(title);
    paramCount++;
  }

  if (description !== undefined) {
    updateFields.push(`description = $${paramCount}`);
    params.push(description);
    paramCount++;
  }

  if (status !== undefined) {
    updateFields.push(`status = $${paramCount}`);
    params.push(status);
    paramCount++;

    // If status is completed, set completed_at
    if (status === 'completed') {
      updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
    }
  }

  if (priority !== undefined) {
    updateFields.push(`priority = $${paramCount}`);
    params.push(priority);
    paramCount++;
  }

  if (due_date !== undefined) {
    updateFields.push(`due_date = $${paramCount}`);
    params.push(due_date);
    paramCount++;
  }

  if (assigned_to !== undefined) {
    updateFields.push(`assigned_to = $${paramCount}`);
    params.push(assigned_to);
    paramCount++;
  }

  if (company_id !== undefined) {
    updateFields.push(`company_id = $${paramCount}`);
    params.push(company_id);
    paramCount++;
  }

  if (contact_id !== undefined) {
    updateFields.push(`contact_id = $${paramCount}`);
    params.push(contact_id);
    paramCount++;
  }

  if (deal_id !== undefined) {
    updateFields.push(`deal_id = $${paramCount}`);
    params.push(deal_id);
    paramCount++;
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  params.push(id);
  const sql = `
    UPDATE tasks
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await query(sql, params);
  return result.rows[0];
};

/**
 * Delete task
 * @param {number|string} id - Task ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteTask = async (id) => {
  const result = await query(
    'DELETE FROM tasks WHERE id = $1 RETURNING id',
    [id]
  );

  return result.rows.length > 0;
};

/**
 * Get tasks by assigned user
 * @param {number|string} userId - User ID
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of tasks
 */
const getTasksByAssignedUser = async (userId, filters = {}) => {
  const { status, priority } = filters;

  let sql = `
    SELECT
      t.*,
      u.first_name as assigned_to_first_name,
      u.last_name as assigned_to_last_name,
      c.name as company_name,
      d.title as deal_title
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN companies c ON t.company_id = c.id
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE t.assigned_to = $1
  `;

  const params = [userId];
  let paramCount = 2;

  if (status) {
    sql += ` AND t.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (priority) {
    sql += ` AND t.priority = $${paramCount}`;
    params.push(priority);
    paramCount++;
  }

  sql += ` ORDER BY t.due_date ASC NULLS LAST`;

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get overdue tasks
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of overdue tasks
 */
const getOverdueTasks = async (filters = {}) => {
  const { assigned_to } = filters;

  let sql = `
    SELECT
      t.*,
      u.first_name as assigned_to_first_name,
      u.last_name as assigned_to_last_name,
      c.name as company_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN companies c ON t.company_id = c.id
    WHERE t.due_date < CURRENT_TIMESTAMP
      AND t.status != 'completed'
  `;

  const params = [];

  if (assigned_to) {
    sql += ` AND t.assigned_to = $1`;
    params.push(assigned_to);
  }

  sql += ` ORDER BY t.due_date ASC`;

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Mark task as completed
 * @param {number|string} id - Task ID
 * @returns {Promise<Object|null>} Updated task or null if not found
 */
const completeTask = async (id) => {
  const sql = `
    UPDATE tasks
    SET status = 'completed', completed_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(sql, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Get task statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Task statistics
 */
const getTaskStats = async (filters = {}) => {
  const { assigned_to, created_by } = filters;

  let sql = `
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN due_date < CURRENT_TIMESTAMP AND status != 'completed' THEN 1 END) as overdue,
      COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
      COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
      COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
    FROM tasks
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (assigned_to) {
    sql += ` AND assigned_to = $${paramCount}`;
    params.push(assigned_to);
    paramCount++;
  }

  if (created_by) {
    sql += ` AND created_by = $${paramCount}`;
    params.push(created_by);
    paramCount++;
  }

  const result = await query(sql, params);
  return result.rows[0];
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByAssignedUser,
  getOverdueTasks,
  completeTask,
  getTaskStats
};
