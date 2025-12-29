const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate an access token
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: 'beta-crm',
    audience: 'beta-crm-client'
  });
}

/**
 * Generate a refresh token (JWT-based, not stored)
 * @param {Object} payload - Token payload (userId)
 * @returns {string} JWT refresh token
 */
function generateRefreshTokenJWT(payload) {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'beta-crm',
    audience: 'beta-crm-client'
  });
}

/**
 * Verify an access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyAccessToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'beta-crm',
      audience: 'beta-crm-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify a refresh token (JWT-based)
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyRefreshTokenJWT(token) {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'beta-crm',
      audience: 'beta-crm-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing both tokens
 */
function generateTokenPair(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshTokenJWT = generateRefreshTokenJWT({ userId: user.id });

  return {
    accessToken,
    refreshToken: refreshTokenJWT,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshTokenJWT,
  verifyAccessToken,
  verifyRefreshTokenJWT,
  decodeToken,
  generateTokenPair
};
