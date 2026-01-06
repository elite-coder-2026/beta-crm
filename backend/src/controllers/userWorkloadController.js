import { userWorkload } from '../models/userWorkload';
import {pool} from "../config/database";
import * as sqlite from "node:sqlite";

/**
 * GET /users/:user_id/tasks
 *
 * Returns all tasks for a given user, with optional status filtering and
 * ordered by urgency and due date.
 *
 * Request params:
 *   - req.params.user_id (string | number)
 *       The ID of the user whose tasks should be fetched.
 *
 * Query parameters:
 *   - req.query.status_filter (string, optional)
 *       · "pending": return only tasks whose status is not "completed".
 *       · "overdue": return only tasks whose status is not "completed"
 *                    and whose due_date is earlier than now (overdue).
 *       · omitted/anything else: no extra status filter is applied.
 *
 * Behavior:
 *   1. Starts from a base SQL query stored in `userWorkload.getAllTasksForUser`
 *      that selects all tasks for the specified user.
 *   2. If `status_filter` is "pending", appends
 *        `and a.status != 'completed'`
 *      to the SQL to exclude completed tasks.
 *   3. If `status_filter` is "overdue", appends
 *        `and a.status != 'completed' and a.due_date < now()`
 *      to the SQL to return only overdue, non-completed tasks.
 *   4. Appends an ORDER BY clause that:
 *        - Puts overdue tasks first
 *          (`case when a.due_date < now() then 0 else 1 end`).
 *        - Then sorts by `a.due_date` ascending.
 *        - Then sorts by `a.priority` using custom priority:
 *            "urgent" (1), "high" (2), "medium" (3),
 *            "low" (4), everything else (5).
 *   5. Executes the SQL with `pool.query(query, [user_id])`.
 *   6. Sends a JSON response:
 *        {
 *          success: true,
 *          user_id: result.rows[0].id,
 *          total_tasks: result.rows.length,
 *          tasks: result.rows
 *        }
 *
 * Error handling:
 *   - Logs any thrown error with `console.error(error)` but does not
 *     currently send an error response to the client.
 */
export const getAllTasksForUser = async (req, res) => {
    try {
        const { user_id } = req.params
        const { status_filter } = req.query

        let query = userWorkload.getAllTasksForUser

        if (status_filter === 'pending') {
            query += `and a.status != 'completed'`
        } else if (status_filter === 'overdue') {
            query += ` and a.status != 'completed' and a.due_date < now()`
        }

        query += `
        order by case when a.due_date < now() then 0 else 1 end,
        a.due_date asc,
        case a.priority
            when 'urgent' then 1
            when 'high' then 2
            when 'medium' then 3
            when 'low' then 4
            else 5
        end
       `
        const result = await pool.query(query, [user_id]);

        res.json({
            success: true,
            user_id: result.rows[0].id,
            total_tasks: result.rows.length,
            tasks: result.rows
        })
    } catch (error) {
        console.error(error);
        res.status(503).json({
            success: false,
            error: 'internal server error',
            message: error.message
        })
    }
}