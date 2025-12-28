const bcrypt = require('bcrypt');
const { query } = require('../config/database');

const SALT_ROUNDS = 12;

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  static async create({ email, password, firstName, lastName, phone, role = 'user' }) {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, phone, role, avatar_url, is_active, created_at, updated_at
    `;

    const values = [email, passwordHash, firstName, lastName, phone, role];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user's last login timestamp
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async updateLastLogin(userId) {
    const sql = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1';
    await query(sql, [userId]);
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  static async update(userId, updates) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, role, avatar_url, is_active, created_at, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Deactivate user account
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async deactivate(userId) {
    const sql = 'UPDATE users SET is_active = false WHERE id = $1';
    await query(sql, [userId]);
  }

  /**
   * Get user without sensitive data
   * @param {Object} user - User object
   * @returns {Object} User without password hash
   */
  static sanitize(user) {
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Check if email already exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email) {
    const sql = 'SELECT id FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows.length > 0;
  }
}

module.exports = User;
