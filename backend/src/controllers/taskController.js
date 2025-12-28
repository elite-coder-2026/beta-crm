const { query } = require('../config/database');
import { tasks } from './queries'
/**
 * Get all tasks with optional filtering
 * GET /api/tasks
 */
const getAllTasks = async (req, res, next) => {
  try {
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
    } = req.query;

    let sql = tasks.getAllTasks;

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

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = tasks.getTaskById

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new task
 * POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
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
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const sql = tasks.createTask;

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

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    // Check if task exists
    const checkResult = await query(tasks.checkIfTaskExists, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      params.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;

      // If status is completed, set completed_at
      if (status === 'completed') {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      params.push(due_date);
      paramCount++;
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramCount}`);
      params.push(assigned_to);
      paramCount++;
    }

    if (company_id !== undefined) {
      updates.push(`company_id = $${paramCount}`);
      params.push(company_id);
      paramCount++;
    }

    if (contact_id !== undefined) {
      updates.push(`contact_id = $${paramCount}`);
      params.push(contact_id);
      paramCount++;
    }

    if (deal_id !== undefined) {
      updates.push(`deal_id = $${paramCount}`);
      params.push(deal_id);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    params.push(id);

    // todo: im going to leave this query right here
    const sql = `
      update beta_crm_db.tasks t
         set ${updates.join(', ')}
         where t.id = ${paramCount}
    `
    const result = await query(sql, params);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      tasks.deleteTask,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tasks by assigned user
 * GET /api/tasks/assigned/:userId
 */
const getTasksByAssignedUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, priority } = req.query;

    let sql = tasks.getTasksByAssignedUser

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

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overdue tasks
 * GET /api/tasks/overdue
 */
const getOverdueTasks = async (req, res, next) => {
  try {
    const { assigned_to } = req.query;

    let sql = tasks.getOverdueTask

    const params = [];

    if (assigned_to) {
      sql += ` AND t.assigned_to = $1`;
      params.push(assigned_to);
    }

    sql += ` ORDER BY t.due_date ASC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark task as completed
 * PATCH /api/tasks/:id/complete
 */
const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(tasks.completedTasks, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task marked as completed',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByAssignedUser,
  getOverdueTasks,
  completeTask
};
