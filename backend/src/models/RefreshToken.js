const { query } = require('../config/database');
const crypto = require('crypto');

class RefreshToken {
  /**
   * Generate a random token string
   * @returns {string} Random token
   */
  static generateToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Create a new refresh token
   * @param {number} userId - User ID
   * @param {number} expiresInDays - Days until expiration (default 7)
   * @returns {Promise<Object>} Created refresh token
   */
  static async create(userId, expiresInDays = 7) {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const sql = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [userId, token, expiresAt];
    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Find refresh token by token string
   * @param {string} token - Token string
   * @returns {Promise<Object|null>} Token object or null
   */
  static async findByToken(token) {
    const sql = `
      SELECT * FROM refresh_tokens
      WHERE token = $1
      AND revoked_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await query(sql, [token]);
    return result.rows[0] || null;
  }

  /**
   * Revoke a refresh token
   * @param {string} token - Token to revoke
   * @param {string} replacedByToken - New token that replaces this one
   * @returns {Promise<void>}
   */
  static async revoke(token, replacedByToken = null) {
    const sql = `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP,
          replaced_by_token = $2
      WHERE token = $1
    `;
    await query(sql, [token, replacedByToken]);
  }

  /**
   * Revoke all refresh tokens for a user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async revokeAllForUser(userId) {
    const sql = `
      UPDATE refresh_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      AND revoked_at IS NULL
    `;
    await query(sql, [userId]);
  }

  /**
   * Delete expired tokens (cleanup)
   * @returns {Promise<number>} Number of deleted tokens
   */
  static async deleteExpired() {
    const sql = `
      DELETE FROM refresh_tokens
      WHERE expires_at < CURRENT_TIMESTAMP
      OR revoked_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
    `;
    const result = await query(sql);
    return result.rowCount;
  }

  /**
   * Get all active tokens for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of active tokens
   */
  static async getActiveTokensForUser(userId) {
    const sql = `
      SELECT * FROM refresh_tokens
      WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  /**
   * Check if token is valid
   * @param {string} token - Token to check
   * @returns {Promise<boolean>} True if token is valid
   */
  static async isValid(token) {
    const tokenRecord = await this.findByToken(token);
    return tokenRecord !== null;
  }
}

module.exports = RefreshToken;
